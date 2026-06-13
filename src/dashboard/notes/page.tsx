import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Coins,
  Download,
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import getNotes from "../../api/getNotes";
import getNoteStats from "../../api/getNoteStats";
import Spinner from "../../components/Spinner";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import Pagination from "../../components/Pagination";
import { cn } from "../../lib/utils";
import { exportNotesToExcel } from "../../lib/export-excel";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";
import NoteCard from "./note-card";
import type { DashboardNote, NoteFilterKey } from "./note-utils";
import { fmtCoins, mapNote } from "./note-utils";
import { useToast } from "../../components/ui/use-toast";

const SEARCH_DEBOUNCE_MS = 400;

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  delay?: number;
  highlight?: boolean;
};

function StatCard({
  label,
  value,
  sub,
  icon,
  gradient,
  glow,
  delay = 0,
  highlight,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5",
        highlight
          ? "border-amber-500/40 hover:border-amber-500/60"
          : "border-border/50 hover:border-border/80"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -end-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-50 group-hover:opacity-80",
          glow
        )}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-foreground sm:text-3xl">
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition-all",
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border/50 bg-card/60 text-muted-foreground hover:border-border hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function DashboardNotes() {
  const [t, i18n] = useTranslation("global");
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const params = new URLSearchParams(search);
  const page = Number(params.get("page") || 1);
  const searchQuery = params.get("search") || "";
  const filter = (params.get("filter") as NoteFilterKey) || "all";
  const userId = params.get("user") || "";
  const dateFromParam = params.get("dateFrom") || "";
  const dateToParam = params.get("dateTo") || "";

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (!dateFromParam) return undefined;
    return {
      from: new Date(dateFromParam),
      to: dateToParam ? new Date(dateToParam) : new Date(dateFromParam),
    };
  });

  const { toast } = useToast();
  const dashboardBase = import.meta.env.VITE_DASHBOARD;

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(search);
      if (searchInput.trim()) {
        next.set("search", searchInput.trim());
        next.set("page", "1");
      } else {
        next.delete("search");
      }
      const nextStr = next.toString();
      if (nextStr !== search.replace(/^\?/, "")) {
        navigate({ pathname, search: nextStr }, { replace: true });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput, navigate, pathname, search]);

  const setFilter = useCallback(
    (value: NoteFilterKey) => {
      const next = new URLSearchParams(search);
      if (value === "all") next.delete("filter");
      else next.set("filter", value);
      next.set("page", "1");
      navigate({ pathname, search: next.toString() }, { replace: true });
    },
    [navigate, pathname, search]
  );

  const applyDateRange = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);
      const next = new URLSearchParams(search);
      if (range?.from) {
        next.set("dateFrom", format(range.from, "yyyy-MM-dd"));
        next.set(
          "dateTo",
          format(range.to ?? range.from, "yyyy-MM-dd")
        );
      } else {
        next.delete("dateFrom");
        next.delete("dateTo");
      }
      next.set("page", "1");
      navigate({ pathname, search: next.toString() }, { replace: true });
    },
    [navigate, pathname, search]
  );

  const dateFrom = dateFromParam;
  const dateTo = dateToParam || dateFromParam;

  const token = localStorage.getItem("token") as string;

  const statsQuery = useQuery({
    queryKey: ["note-stats", dateFrom, dateTo],
    queryFn: async () => {
      const res = await getNoteStats(token, {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      return res.data.result;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const notesQuery = useQuery({
    queryKey: ["notes", page, filter, searchQuery, userId, dateFrom, dateTo],
    queryFn: async () => {
      const response = await getNotes({
        token,
        page: String(page),
        filter,
        search: searchQuery,
        userId: userId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const notes = ((response.data.result?.notes as DashboardNote[]) || []).map(mapNote);
      return {
        totalPages: response.data.result.totalPages as number,
        total: response.data.result.total as number,
        notes,
      };
    },
    refetchOnWindowFocus: false,
  });

  const refetchAll = () => {
    statsQuery.refetch();
    notesQuery.refetch();
  };

  const columns = useMemo(
    () => createColumns(t, notesQuery, i18n.language),
    [t, notesQuery, i18n.language]
  );

  const notes = notesQuery.data?.notes ?? [];
  const stats = statsQuery.data;
  const totalPages = notesQuery.data?.totalPages ?? 1;
  const activeFilters =
    (searchQuery ? 1 : 0) +
    (filter !== "all" ? 1 : 0) +
    (userId ? 1 : 0) +
    (dateFrom ? 1 : 0);

  const clearFilters = () => {
    setSearchInput("");
    setDateRange(undefined);
    navigate({ pathname, search: "" }, { replace: true });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await getNotes({
        token,
        filter,
        search: searchQuery,
        userId: userId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        exportAll: true,
      });
      const rows = ((response.data.result?.notes as DashboardNote[]) || []).map(mapNote);
      if (!rows.length) {
        toast({ title: t("no_results"), variant: "destructive" });
        return;
      }
      exportNotesToExcel(
        rows,
        `deposits-${format(new Date(), "yyyy-MM-dd")}.xlsx`,
        i18n.language
      );
      toast({ title: t("export_done") });
    } catch {
      toast({ title: t("error") || "Error", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  if (notesQuery.isLoading && !notesQuery.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 md:px-6 md:py-8">
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-amber-600/15 via-card to-emerald-600/10 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 shadow-lg">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                {t("notes")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("notes_page_subtitle")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to={`/${dashboardBase}/reconciliation`}>{t("daily_reconciliation")}</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="h-4 w-4" />
              {exporting ? t("loading") : t("export_excel")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={refetchAll}
              disabled={notesQuery.isFetching}
            >
              <RefreshCw
                className={cn("h-4 w-4", notesQuery.isFetching && "animate-spin")}
              />
              {t("refresh")}
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("note_pending")}
          value={stats?.pending ?? "—"}
          sub={`${stats?.todayPending ?? 0} ${t("note_today")}`}
          icon={<Clock className="h-5 w-5" />}
          gradient="from-amber-500 to-orange-600"
          glow="bg-amber-500/30"
          delay={0.05}
          highlight={(stats?.pending ?? 0) > 0}
        />
        <StatCard
          label={t("note_pending_amount")}
          value={fmtCoins(stats?.pendingAmount ?? 0)}
          sub={t("note_pending_amount_sub")}
          icon={<Coins className="h-5 w-5" />}
          gradient="from-cyan-500 to-blue-600"
          glow="bg-cyan-500/30"
          delay={0.1}
        />
        <StatCard
          label={t("note_approved_today")}
          value={stats?.todaySuccess ?? "—"}
          sub={`${stats?.monthSuccess ?? 0} ${t("note_this_month")}`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          gradient="from-emerald-500 to-teal-600"
          glow="bg-emerald-500/30"
          delay={0.15}
        />
        <StatCard
          label={t("rejected")}
          value={stats?.rejected ?? "—"}
          sub={`${stats?.success ?? 0} ${t("note_total_approved")}`}
          icon={<XCircle className="h-5 w-5" />}
          gradient="from-rose-500 to-red-600"
          glow="bg-rose-500/30"
          delay={0.2}
        />
      </section>

      {userId && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span>
            {t("note_user_filter")} <strong>#{userId}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => {
              const next = new URLSearchParams(search);
              next.delete("user");
              navigate({ pathname, search: next.toString() }, { replace: true });
            }}
          >
            <X className="h-3.5 w-3.5" />
            {t("clear_user_filter")}
          </Button>
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("search_notes")}
                className="ps-9"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start gap-2 font-normal sm:w-[260px]",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} –{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    t("filter_by_date")
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={applyDateRange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex rounded-xl border border-border/50 bg-background/50 p-1">
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
              {t("view_cards")}
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
              {t("view_table")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            {t("all")}
          </FilterPill>
          <FilterPill active={filter === "pinding"} onClick={() => setFilter("pinding")}>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t("pending")}
            </span>
          </FilterPill>
          <FilterPill active={filter === "success"} onClick={() => setFilter("success")}>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {t("succeed")}
            </span>
          </FilterPill>
          <FilterPill active={filter === "reject"} onClick={() => setFilter("reject")}>
            <span className="inline-flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {t("rejected")}
            </span>
          </FilterPill>

          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5" />
              {t("clear_filters")}
            </Button>
          )}

          <span className="ms-auto text-xs text-muted-foreground">
            {notesQuery.data?.total ?? notes.length} {t("results")}
          </span>
        </div>
      </section>

      {notesQuery.isFetching && !notesQuery.isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : null}

      {viewMode === "cards" ? (
        notes.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {notes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                >
                  <NoteCard note={note} query={notesQuery} />
                </motion.div>
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination siblingCount={1} currentPage={page} totalPageCount={totalPages} />
            )}
          </>
        ) : (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
            <Wallet className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-bold text-foreground">{t("no_results")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("note_empty_hint")}</p>
          </div>
        )
      ) : (
        <DataTable
          columns={columns}
          data={notes}
          totalPages={totalPages}
          currentPage={page}
        />
      )}
    </div>
  );
}
