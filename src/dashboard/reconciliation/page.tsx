import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  Coins,
  Download,
  RefreshCw,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import getDailyReconciliation from "../../api/getDailyReconciliation";
import Spinner from "../../components/Spinner";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { cn } from "../../lib/utils";
import { exportReconciliationToExcel } from "../../lib/export-excel";
import NoteStatusBadge from "../notes/note-status-badge";
import { fmtCoins, formatNoteDate } from "../notes/note-utils";
import { useToast } from "../../components/ui/use-toast";

export default function DashboardReconciliation() {
  const [t, i18n] = useTranslation("global");
  const isRtl = i18n.language === "ar";
  const { toast } = useToast();
  const token = localStorage.getItem("token") as string;
  const dashboardBase = import.meta.env.VITE_DASHBOARD;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [exporting, setExporting] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const query = useQuery({
    queryKey: ["reconciliation", dateStr],
    queryFn: async () => {
      const res = await getDailyReconciliation(token, dateStr);
      return res.data.result;
    },
    refetchOnWindowFocus: false,
  });

  const data = query.data;
  const summary = data?.summary;

  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    try {
      exportReconciliationToExcel(
        data,
        `reconciliation-${dateStr}.xlsx`,
        i18n.language
      );
      toast({ title: t("export_done") });
    } finally {
      setExporting(false);
    }
  };

  if (query.isLoading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-violet-600/15 via-card to-cyan-600/10 p-6 sm:p-8"
      >
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg">
              <CalendarIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                {t("daily_reconciliation")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("daily_reconciliation_subtitle")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to={`/${dashboardBase}/notes`}>
                <ArrowLeft className="h-4 w-4" />
                {t("notes")}
              </Link>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleExport}
              disabled={!data || exporting}
            >
              <Download className="h-4 w-4" />
              {exporting ? t("loading") : t("export_excel")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
            >
              <RefreshCw className={cn("h-4 w-4", query.isFetching && "animate-spin")} />
              {t("refresh")}
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label={t("note_deposits_day")}
          value={summary?.notesCount ?? 0}
          sub={`${t("succeed")}: ${summary?.notesSuccessCount ?? 0}`}
          icon={<Wallet className="h-5 w-5" />}
          gradient="from-amber-500 to-orange-600"
        />
        <SummaryCard
          label={t("note_success_amount_day")}
          value={fmtCoins(summary?.notesSuccessAmount ?? 0)}
          sub={`${t("pending")}: ${fmtCoins(summary?.notesPendingAmount ?? 0)}`}
          icon={<Coins className="h-5 w-5" />}
          gradient="from-emerald-500 to-teal-600"
        />
        <SummaryCard
          label={t("orders_day")}
          value={summary?.ordersCount ?? 0}
          sub={t("orders_paid_day")}
          icon={<ShoppingCart className="h-5 w-5" />}
          gradient="from-violet-500 to-purple-600"
        />
        <SummaryCard
          label={t("orders_total_day")}
          value={fmtCoins(summary?.ordersTotal ?? 0)}
          sub={dateStr}
          icon={<CheckCircle2 className="h-5 w-5" />}
          gradient="from-cyan-500 to-blue-600"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Wallet className="h-5 w-5 text-primary" />
            {t("notes")} ({data?.notes.length ?? 0})
          </h2>
          <div className="max-h-[420px] overflow-auto rounded-xl border border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("users")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.notes.length ? (
                  data.notes.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-mono text-xs">#{n.id}</TableCell>
                      <TableCell>
                        <p className="truncate text-sm font-medium">{n.user?.user_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{n.user?.email}</p>
                      </TableCell>
                      <TableCell className="font-bold tabular-nums">
                        {fmtCoins(n.coins)}
                      </TableCell>
                      <TableCell>
                        <NoteStatusBadge status={n.status} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      {t("no_results")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {t("orders")} ({data?.orders.length ?? 0})
          </h2>
          <div className="max-h-[420px] overflow-auto rounded-xl border border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("products")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.orders.length ? (
                  data.orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">#{o.id}</TableCell>
                      <TableCell>
                        <p className="truncate text-sm font-medium">{o.product?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {o.user?.user_name}
                        </p>
                      </TableCell>
                      <TableCell className="font-bold tabular-nums">
                        {fmtCoins(o.total)}
                      </TableCell>
                      <TableCell>
                        <NoteStatusBadge status={o.status} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      {t("no_results")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        {t("reconciliation_footer")} · {formatNoteDate(`${dateStr}T12:00:00`, i18n.language)}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
  gradient,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/90 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
