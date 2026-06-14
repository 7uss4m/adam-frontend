import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { format, subDays } from "date-fns";
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
  X,
} from "lucide-react";
import { FaCashRegister } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import getAllChargings from "../../api/getAllChargings";
import Spinner from "../../components/Spinner";
import Pagination from "../../components/Pagination";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { exportChargesToExcel } from "../../lib/export-excel";
import { cn } from "../../lib/utils";
import ChargeCard from "./charge-card";
import {
  ChargeFilterKey,
  computeChargeStats,
  DashboardCharge,
  fmtCoins,
  mapCharge,
  matchesChargeDateRange,
  matchesChargeFilter,
  matchesChargeSearch,
} from "./charge-utils";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

function StatCard({
  label,
  value,
  sub,
  icon,
  gradient,
  glow,
  delay = 0,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  delay?: number;
  highlight?: boolean;
}) {
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

export default function DashboardCharges() {
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const { search } = useLocation();

  const params = new URLSearchParams(search);
  const page = Math.max(1, Number(params.get("page") || 1));
  const filter = (params.get("filter") as ChargeFilterKey) || "all";

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const chargesQuery = useQuery({
    queryKey: ["charges"],
    queryFn: async () => {
      const response = await getAllChargings(localStorage.getItem("token") as string);
      const raw = response.data.result as Record<string, unknown>[];
      return raw.map(mapCharge);
    },
    refetchOnWindowFocus: false,
  });

  const allCharges = chargesQuery.data ?? [];

  const filtered = useMemo(() => {
    return allCharges.filter(
      (c) =>
        matchesChargeFilter(c, filter) &&
        matchesChargeSearch(c, debouncedSearch) &&
        matchesChargeDateRange(c, dateRange)
    );
  }, [allCharges, filter, debouncedSearch, dateRange]);

  const stats = useMemo(() => computeChargeStats(filtered), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const columns = useMemo(() => createColumns(t, i18n.language), [t, i18n.language]);

  const setFilter = (f: ChargeFilterKey) => {
    const p = new URLSearchParams(search);
    if (f === "all") p.delete("filter");
    else p.set("filter", f);
    p.delete("page");
    navigate({ search: p.toString() ? `?${p}` : "" }, { replace: true });
  };

  const handleExport = () => {
    exportChargesToExcel(
      filtered,
      `charges-${format(new Date(), "yyyy-MM-dd")}.xlsx`,
      i18n.language
    );
  };

  if (chargesQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (chargesQuery.isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("something_went_wrong")}</p>
        <Button variant="outline" onClick={() => chargesQuery.refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("refresh")}
        </Button>
      </div>
    );
  }

  return (
    <div
      dir={i18n.language === "en" ? "ltr" : "rtl"}
      className="space-y-8 pb-10"
    >
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <FaCashRegister className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-orbitron text-xl font-bold text-foreground sm:text-2xl">
              {t("charges")}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t("charges_page_subtitle")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => chargesQuery.refetch()}
            disabled={chargesQuery.isFetching}
            aria-label={t("refresh")}
          >
            <RefreshCw className={cn("h-4 w-4", chargesQuery.isFetching && "animate-spin")} />
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            disabled={!filtered.length}
          >
            <Download className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </motion.header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("charges_total")}
          value={stats.total}
          sub={t("charges_total_hint")}
          icon={<FaCashRegister className="h-5 w-5" />}
          gradient="from-violet-500 to-purple-600"
          glow="bg-violet-500/30"
          delay={0.05}
        />
        <StatCard
          label={t("charges_total_amount")}
          value={fmtCoins(stats.totalCoins)}
          sub={t("charges_filtered")}
          icon={<Coins className="h-5 w-5" />}
          gradient="from-emerald-500 to-teal-600"
          glow="bg-emerald-500/30"
          delay={0.1}
        />
        <StatCard
          label={t("charges_status_done")}
          value={stats.doneCount}
          sub={`${t("charges_type_online")}: ${stats.onlineCount}`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          gradient="from-blue-500 to-indigo-600"
          glow="bg-blue-500/30"
          delay={0.15}
        />
        <StatCard
          label={t("charges_status_pending")}
          value={stats.pendingCount}
          sub={`${t("charges_today")}: ${stats.todayCount}`}
          icon={<Clock className="h-5 w-5" />}
          gradient="from-amber-500 to-orange-600"
          glow="bg-amber-500/30"
          delay={0.2}
          highlight={stats.pendingCount > 0}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("charges_search_placeholder")}
              className="ps-9 pe-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 font-normal">
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} – {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    t("charges_pick_date")
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <div className="flex rounded-xl border border-border/50 p-0.5">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 gap-1.5 px-2.5"
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 gap-1.5 px-2.5"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(
            [
              ["all", t("charges_filter_all")],
              ["admin", t("charges_type_admin")],
              ["online", t("charges_type_online")],
              ["done", t("charges_status_done")],
              ["pending", t("charges_status_pending")],
            ] as const
          ).map(([key, label]) => (
            <FilterPill key={key} active={filter === key} onClick={() => setFilter(key)}>
              {label}
            </FilterPill>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
          <FaCashRegister className="h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold text-foreground">{t("charges_empty")}</p>
        </div>
      ) : viewMode === "cards" ? (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {paginated.map((charge, i) => (
              <motion.div
                key={charge.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.25 }}
              >
                <ChargeCard charge={charge} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <DataTable columns={columns} data={paginated} />
      )}

      {filtered.length > PAGE_SIZE && (
        <Pagination
          siblingCount={1}
          currentPage={safePage}
          totalPageCount={totalPages}
        />
      )}
    </div>
  );
}
