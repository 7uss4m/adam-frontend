import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import getUsers from "../../api/getUsers";
import getUserStats from "../../api/getUserStats";
import Spinner from "../../components/Spinner";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import type { User } from "../../types/types";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";
import UserCard from "./user-card";
import { fmtUsd } from "./user-utils";
import Pagination from "../../components/Pagination";

const SEARCH_DEBOUNCE_MS = 400;

type FilterKey = "all" | "verified" | "debt" | "high_balance";
type ViewMode = "cards" | "table";

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  delay?: number;
};

function StatCard({ label, value, sub, icon, gradient, glow, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md sm:p-5"
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

export default function DashboardUsers() {
  const [t, i18n] = useTranslation("global");
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const params = new URLSearchParams(search);
  const page = Number(params.get("page") || 1);
  const searchQuery = params.get("search") || "";
  const filter = (params.get("filter") as FilterKey) || "all";

  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [searchInput, setSearchInput] = useState(searchQuery);

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
    (value: FilterKey) => {
      const next = new URLSearchParams(search);
      if (value === "all") next.delete("filter");
      else next.set("filter", value);
      next.set("page", "1");
      navigate({ pathname, search: next.toString() }, { replace: true });
    },
    [navigate, pathname, search]
  );

  const statsQuery = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const res = await getUserStats(localStorage.getItem("token") as string);
      return res.data.result;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const usersQuery = useQuery({
    queryKey: ["users", "all", page, searchQuery, filter],
    queryFn: async () => {
      const response = await getUsers({
        token: localStorage.getItem("token") as string,
        page,
        search: searchQuery,
        filter,
      });
      const users = (response.data.result.users as User[]).map((user) => ({
        ...user,
        balance: Number(user.balance),
        debit:
          user.debt_coins && user.debt_coins.length > 0
            ? Number(user.debt_coins[0].coins)
            : Number(user.debit || 0),
      }));
      return {
        totalPages: response.data.result.totalPages,
        total: response.data.result.total ?? users.length,
        users,
      };
    },
    refetchOnWindowFocus: false,
  });

  const refetchAll = () => {
    statsQuery.refetch();
    usersQuery.refetch();
  };

  const columns = useMemo(
    () => createColumns(t, usersQuery),
    [t, usersQuery]
  );

  const users = usersQuery.data?.users ?? [];
  const stats = statsQuery.data;
  const activeFilters = (searchQuery ? 1 : 0) + (filter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSearchInput("");
    navigate({ pathname, search: "" }, { replace: true });
  };

  if (usersQuery.isLoading && !usersQuery.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 md:px-6 md:py-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-violet-600/15 via-card to-cyan-600/10 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                {t("users")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("users_page_subtitle") ||
                  "إدارة المستخدمين — رصيد، مستويات، ديون، وإجراءات سريعة"}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0 gap-2 self-start"
            onClick={refetchAll}
            disabled={usersQuery.isFetching}
          >
            <RefreshCw
              className={cn("h-4 w-4", usersQuery.isFetching && "animate-spin")}
            />
            {t("refresh")}
          </Button>
        </div>
      </motion.section>

      {/* Stats */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("total_users") || "إجمالي المستخدمين"}
            value={stats.total.toLocaleString()}
            sub={`+${stats.newThisMonth} ${t("this_month")}`}
            icon={<Users className="h-5 w-5" />}
            gradient="from-violet-500 to-purple-600"
            glow="bg-violet-500/30"
            delay={0.05}
          />
          <StatCard
            label={t("verified_users") || "حسابات موثّقة"}
            value={stats.verified.toLocaleString()}
            sub={`${stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%`}
            icon={<BadgeCheck className="h-5 w-5" />}
            gradient="from-emerald-500 to-teal-600"
            glow="bg-emerald-500/30"
            delay={0.1}
          />
          <StatCard
            label={t("total_balances") || "إجمالي الأرصدة"}
            value={fmtUsd(stats.totalBalance)}
            icon={<Wallet className="h-5 w-5" />}
            gradient="from-cyan-500 to-blue-600"
            glow="bg-cyan-500/30"
            delay={0.15}
          />
          <StatCard
            label={t("users_with_debt") || "مستخدمون بدين"}
            value={stats.withDebt}
            sub={fmtUsd(stats.totalDebt)}
            icon={<ShieldAlert className="h-5 w-5" />}
            gradient="from-rose-500 to-pink-600"
            glow="bg-rose-500/30"
            delay={0.2}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="dashboard-panel space-y-4 !p-4 md:!p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("filter_emails") || "بحث بالاسم أو البريد..."}
              className="ps-9 bg-background/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border/50 p-1">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="h-4 w-4" />
                {t("cards_view")}
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
                {t("table_view")}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            {t("all")}
          </FilterPill>
          <FilterPill active={filter === "verified"} onClick={() => setFilter("verified")}>
            <span className="flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5" />
              {t("verified") || "موثّق"}
            </span>
          </FilterPill>
          <FilterPill active={filter === "debt"} onClick={() => setFilter("debt")}>
            <span className="flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              {t("has_debt") || "لديه دين"}
            </span>
          </FilterPill>
          <FilterPill
            active={filter === "high_balance"}
            onClick={() => setFilter("high_balance")}
          >
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {t("high_balance") || "رصيد عالي"}
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
              {t("clear_filters") || "مسح"} ({activeFilters})
            </Button>
          )}

          {usersQuery.data?.total != null && (
            <span className="ms-auto text-xs font-semibold text-muted-foreground">
              {usersQuery.data.total} {t("users")}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {usersQuery.isFetching && !users.length ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : usersQuery.isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-destructive">{t("something_went_wrong")}</p>
          <Button variant="secondary" className="mt-4" onClick={() => usersQuery.refetch()}>
            {t("retry")}
          </Button>
        </div>
      ) : viewMode === "cards" ? (
        <>
          {users.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-20">
              <UserPlus className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">{t("no_results")}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {users.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <UserCard user={user} query={usersQuery} />
                </motion.div>
              ))}
            </div>
          )}
          {(usersQuery.data?.totalPages ?? 1) > 1 && (
            <Pagination
              siblingCount={1}
              currentPage={page}
              totalPageCount={usersQuery.data?.totalPages ?? 1}
            />
          )}
        </>
      ) : (
        <div className="dashboard-panel !p-0 overflow-hidden">
          <DataTable
            columns={columns}
            data={users}
            currentPage={page}
            totalPages={usersQuery.data?.totalPages ?? 1}
          />
        </div>
      )}
    </div>
  );
}
