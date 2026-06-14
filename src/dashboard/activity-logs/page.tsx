import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ClipboardList,
  RefreshCw,
  Search,
  Shield,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import getDashboardActivityLogs, {
  type DashboardActivityLog,
} from "../../api/getDashboardActivityLogs";
import Spinner from "../../components/Spinner";
import Pagination from "../../components/Pagination";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { formatPaymentDateTime } from "../../lib/payment-note-display";

const ACTION_OPTIONS = [
  "all",
  "login",
  "create",
  "update",
  "delete",
  "status_change",
  "charge",
  "balance_update",
] as const;

const RESOURCE_OPTIONS = [
  "all",
  "auth",
  "users",
  "orders",
  "notes",
  "products",
  "categories",
  "ads",
  "levels",
  "currencies",
  "boxes",
  "notifications",
  "admins",
  "charges",
  "debts",
  "settings",
  "clients",
  "agencies",
  "inventory",
  "system",
] as const;

function actionBadgeClass(action: string) {
  switch (action) {
    case "login":
      return "border-blue-500/30 bg-blue-500/10 text-blue-500";
    case "create":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
    case "update":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-500";
    case "delete":
      return "border-red-500/30 bg-red-500/10 text-red-500";
    case "status_change":
      return "border-amber-500/30 bg-amber-500/10 text-amber-500";
    case "charge":
    case "balance_update":
      return "border-violet-500/30 bg-violet-500/10 text-violet-500";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
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
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ActivityRow({
  log,
  locale,
  t,
}: {
  log: DashboardActivityLog;
  locale: string;
  t: (k: string) => string;
}) {
  const { full } = formatPaymentDateTime(log.created_at, locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/50 bg-card/80 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px]", actionBadgeClass(log.action))}>
              {t(`activity_action_${log.action}`) || log.action}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {t(`activity_resource_${log.resource}`) || log.resource}
            </Badge>
            {log.resourceId && (
              <span className="font-mono text-[10px] text-muted-foreground">
                #{log.resourceId}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-foreground">{log.description}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              {t("activity_admin")}:{" "}
              <span className="font-semibold text-foreground">
                {log.adminName || log.adminEmail || "—"}
              </span>
            </span>
            {log.ip && (
              <span>
                IP: <span className="font-mono">{log.ip}</span>
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-xs text-muted-foreground lg:text-end">
          {full}
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardActivityLogsPage() {
  const [t, i18n] = useTranslation("global");
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const page = params.get("page") || "1";
  const action = params.get("action") || "all";
  const resource = params.get("resource") || "all";
  const dateFrom = params.get("dateFrom") || "";
  const dateTo = params.get("dateTo") || "";

  const [searchInput, setSearchInput] = useState(params.get("search") || "");

  useEffect(() => {
    setSearchInput(params.get("search") || "");
  }, [params]);

  const token = localStorage.getItem("token") || "";

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["activity-logs", page, action, resource, dateFrom, dateTo, params.get("search")],
    queryFn: async () => {
      const res = await getDashboardActivityLogs(token, {
        page,
        search: params.get("search") || undefined,
        action,
        resource,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      return res.data.result;
    },
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const errorMessage =
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
    (error instanceof Error ? error.message : null);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(search);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
      });
      if (!updates.page) next.set("page", "1");
      navigate({ search: next.toString() }, { replace: true });
    },
    [navigate, search]
  );

  const onSearch = () => {
    updateParams({ search: searchInput.trim() || null, page: "1" });
  };

  const retentionDays = data?.retentionDays ?? 30;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-orbitron text-xl font-bold text-foreground sm:text-2xl">
              {t("activity_log")}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t("activity_log_subtitle")}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 self-end sm:self-auto"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          {t("refresh")}
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {t("activity_log_retention_title")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("activity_log_retention_hint", { days: retentionDays })}
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border/50 bg-card/60 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("search")}
          </label>
          <div className="flex gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder={t("activity_log_search_placeholder")}
              className="bg-background/60"
            />
            <Button type="button" onClick={onSearch} className="shrink-0 gap-2">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("date")} {t("from") || "from"}
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => updateParams({ dateFrom: e.target.value || null, page: "1" })}
            className="bg-background/60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("date")} {t("to") || "to"}
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => updateParams({ dateTo: e.target.value || null, page: "1" })}
            className="bg-background/60"
          />
        </div>

        <div className="rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">
            {t("total")}
          </p>
          <p className="text-2xl font-black tabular-nums text-foreground">
            {data?.total ?? 0}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("activity_action")}
        </p>
        <div className="flex flex-wrap gap-2">
          {ACTION_OPTIONS.map((key) => (
            <FilterPill
              key={key}
              active={action === key}
              onClick={() => updateParams({ action: key, page: "1" })}
            >
              {t(key === "all" ? "all" : `activity_action_${key}`)}
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("activity_resource")}
        </p>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_OPTIONS.map((key) => (
            <FilterPill
              key={key}
              active={resource === key}
              onClick={() => updateParams({ resource: key, page: "1" })}
            >
              {t(key === "all" ? "all" : `activity_resource_${key}`)}
            </FilterPill>
          ))}
        </div>
      </div>

      {!token ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/60 py-16">
          <Shield className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">{t("login")}</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 py-16 px-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <div>
            <p className="font-semibold text-foreground">{t("something_went_wrong")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {errorMessage || t("activity_log_load_error")}
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("refresh")}
          </Button>
        </div>
      ) : !data?.logs?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/60 py-16">
          <Shield className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">{t("activity_log_empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.logs.map((log) => (
            <ActivityRow
              key={log.id}
              log={log}
              locale={i18n.language}
              t={t}
            />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={Number(page)}
          totalPageCount={data.totalPages}
          siblingCount={1}
        />
      )}
    </div>
  );
}
