import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Clock,
  Coins,
  HandCoins,
  LayoutDashboard,
  Megaphone,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { BiCategoryAlt } from "react-icons/bi";
import { FaCashRegister, FaMoneyCheck, FaRegUser } from "react-icons/fa";

import getDashboardStats, {
  type DashboardRecentCharge,
  type DashboardRecentOrder,
} from "../api/getDashboardStats";
import getUser from "../api/getUser";
import Spinner from "../components/Spinner";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import type { User } from "../types/types";

const dash = import.meta.env.VITE_DASHBOARD;

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lg"
    >
      <div
        className={cn(
          "pointer-events-none absolute -end-6 -top-6 h-28 w-28 rounded-full blur-2xl opacity-60 transition-opacity duration-300 group-hover:opacity-100",
          glow
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-black tabular-nums tracking-tight text-foreground sm:text-3xl">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {sub && (
            <p className="text-xs font-medium text-muted-foreground">{sub}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pinding: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    wait: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    reject: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    accept: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  };
  return (
    <span
      className={cn(
        "rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase",
        colors[status] || "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

function MiniChart({
  labels,
  values,
  color,
  maxValue,
}: {
  labels: string[];
  values: number[];
  color: string;
  maxValue: number;
}) {
  return (
    <div className="flex h-40 items-end gap-2">
      {values.map((v, i) => {
        const pct = maxValue > 0 ? Math.max((v / maxValue) * 100, 4) : 4;
        const dayLabel = moment(labels[i]).format("ddd");
        return (
          <div key={labels[i]} className="flex flex-1 flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className={cn("w-full rounded-t-lg", color)}
              title={`${v}`}
            />
            <span className="text-[10px] font-semibold text-muted-foreground">
              {dayLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const ADMIN_ACTIONS = [
  { to: `/${dash}/products`, icon: Package, labelKey: "products", gradient: "from-violet-500 to-purple-600" },
  { to: `/${dash}/orders`, icon: ShoppingCart, labelKey: "orders", gradient: "from-cyan-500 to-blue-600" },
  { to: `/${dash}/users`, icon: FaRegUser, labelKey: "users", gradient: "from-emerald-500 to-teal-600" },
  { to: `/${dash}/categories`, icon: BiCategoryAlt, labelKey: "categories", gradient: "from-amber-500 to-orange-600" },
  { to: `/${dash}/charges`, icon: FaCashRegister, labelKey: "charges", gradient: "from-rose-500 to-pink-600" },
  { to: `/${dash}/reports`, icon: BarChart3, labelKey: "reports", gradient: "from-indigo-500 to-violet-600" },
  { to: `/${dash}/ads`, icon: Megaphone, labelKey: "ads", gradient: "from-fuchsia-500 to-purple-600" },
  { to: `/${dash}/info`, icon: Sparkles, labelKey: "info", gradient: "from-slate-500 to-zinc-600" },
];

const ORDERS_ACTIONS = [
  { to: `/${dash}/clients`, icon: HandCoins, labelKey: "clients", gradient: "from-cyan-500 to-blue-600" },
  { to: `/${dash}/orders`, icon: ShoppingCart, labelKey: "orders", gradient: "from-violet-500 to-purple-600" },
];

function fmtUsd(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function DashboardHome() {
  const [t, i18n] = useTranslation("global");
  const isRtl = i18n.language === "ar";

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await getUser(localStorage.getItem("token") as string);
      return res.data.result as User;
    },
    refetchOnWindowFocus: false,
  });

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await getDashboardStats(localStorage.getItem("token") as string);
      return res.data.result;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const stats = statsQuery.data;
  const isAdmin = stats?.role === "admin";
  const user = userQuery.data;

  const chartMax = useMemo(() => {
    if (!stats?.chart) return 1;
    return Math.max(
      ...stats.chart.revenues,
      ...stats.chart.chargeAmounts,
      ...stats.chart.orderCounts,
      1
    );
  }, [stats?.chart]);

  const statusItems = useMemo(() => {
    if (!stats?.orderStatusBreakdown) return [];
    const b = stats.orderStatusBreakdown;
    return [
      { key: "success", label: t("success") || "success", count: b.success, color: "bg-emerald-500" },
      { key: "pinding", label: t("pending") || "pending", count: b.pinding, color: "bg-amber-500" },
      { key: "wait", label: t("wait") || "wait", count: b.wait, color: "bg-blue-500" },
      { key: "accept", label: t("accept") || "accept", count: b.accept, color: "bg-cyan-500" },
      { key: "reject", label: t("reject") || "reject", count: b.reject, color: "bg-rose-500" },
    ].filter((s) => s.count > 0);
  }, [stats?.orderStatusBreakdown, t]);

  if (statsQuery.isLoading || userQuery.isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (statsQuery.isError || !stats) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("something_wrong_happened")}</p>
        <Button variant="secondary" onClick={() => statsQuery.refetch()}>
          {t("retry") || "إعادة المحاولة"}
        </Button>
      </div>
    );
  }

  const { overview } = stats;
  const actions = isAdmin ? ADMIN_ACTIONS : ORDERS_ACTIONS;
  const displayName = user?.user_name || user?.name || user?.email || "";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-[1600px] space-y-8 px-4 py-6 md:px-6 md:py-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-violet-600/20 via-card to-cyan-600/10 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -start-16 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg">
              <LayoutDashboard className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                {t("dashboard_overview") || "لوحة التحكم"}
              </p>
              <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                {t("welcome_back")}, {displayName}
              </h1>
              <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                {t("dashboard_subtitle") ||
                  "نظرة شاملة على أداء المنصة — إحصائيات حية وتحكم سريع"}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0 gap-2 self-start"
            onClick={() => statsQuery.refetch()}
            disabled={statsQuery.isFetching}
          >
            <RefreshCw className={cn("h-4 w-4", statsQuery.isFetching && "animate-spin")} />
            {t("refresh") || "تحديث"}
          </Button>
        </div>

        {/* Inline summary strip */}
        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t("orders") || "الطلبات", value: overview.orders.total, icon: ShoppingCart },
            {
              label: t("revenue_today") || "إيراد اليوم",
              value: fmtUsd(overview.orders.todayRevenue),
              icon: TrendingUp,
            },
            {
              label: t("pending_orders") || "طلبات معلّقة",
              value: overview.orders.pending,
              icon: Clock,
            },
            {
              label: isAdmin ? t("users") || "المستخدمون" : t("clients") || "العملاء",
              value: isAdmin ? overview.users.total : overview.clients,
              icon: isAdmin ? Users : HandCoins,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-background/40 px-4 py-3 backdrop-blur-sm"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-lg font-black tabular-nums text-foreground">
                  {value}
                </p>
                <p className="truncate text-[10px] font-semibold text-muted-foreground">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("total_revenue") || "إجمالي الإيرادات"}
          value={fmtUsd(overview.orders.totalRevenue)}
          sub={`${t("month_spending")?.replace("مصروفات", "إيراد") || "هذا الشهر"}: ${fmtUsd(overview.orders.monthRevenue)}`}
          icon={<TrendingUp className="h-6 w-6" />}
          gradient="from-emerald-500 to-teal-600"
          glow="bg-emerald-500/30"
          delay={0.05}
        />
        <StatCard
          label={t("orders") || "الطلبات"}
          value={overview.orders.total}
          sub={`${t("today")}: ${overview.orders.today} · ${overview.orders.pending} ${t("pending") || "معلّق"}`}
          icon={<ShoppingCart className="h-6 w-6" />}
          gradient="from-cyan-500 to-blue-600"
          glow="bg-cyan-500/30"
          delay={0.1}
        />
        {isAdmin ? (
          <>
            <StatCard
              label={t("users") || "المستخدمون"}
              value={overview.users.total}
              sub={`+${overview.users.newThisMonth} ${t("this_month") || "هذا الشهر"}`}
              icon={<Users className="h-6 w-6" />}
              gradient="from-violet-500 to-purple-600"
              glow="bg-violet-500/30"
              delay={0.15}
            />
            <StatCard
              label={t("products") || "المنتجات"}
              value={overview.products.total}
              sub={`${overview.products.active} ${t("active") || "نشط"} · ${overview.products.withOffers} ${t("offers") || "عروض"}`}
              icon={<Package className="h-6 w-6" />}
              gradient="from-amber-500 to-orange-600"
              glow="bg-amber-500/30"
              delay={0.2}
            />
            <StatCard
              label={t("charges") || "الشحنات"}
              value={fmtUsd(overview.charges.totalAmount)}
              sub={`${overview.charges.pending} ${t("pending") || "معلّق"} · ${fmtUsd(overview.charges.monthAmount)} ${t("this_month") || "الشهر"}`}
              icon={<Coins className="h-6 w-6" />}
              gradient="from-rose-500 to-pink-600"
              glow="bg-rose-500/30"
              delay={0.25}
            />
            <StatCard
              label={t("debts") || "الديون"}
              value={fmtUsd(overview.debts.totalCoins)}
              sub={`${overview.debts.usersWithDebt} ${t("users") || "مستخدم"}`}
              icon={<FaMoneyCheck className="h-5 w-5" />}
              gradient="from-red-500 to-rose-600"
              glow="bg-red-500/30"
              delay={0.3}
            />
            <StatCard
              label={t("categories") || "الأقسام"}
              value={overview.categories}
              icon={<Tag className="h-6 w-6" />}
              gradient="from-indigo-500 to-violet-600"
              glow="bg-indigo-500/30"
              delay={0.35}
            />
            <StatCard
              label={t("clients") || "العملاء API"}
              value={overview.clients}
              icon={<HandCoins className="h-6 w-6" />}
              gradient="from-sky-500 to-cyan-600"
              glow="bg-sky-500/30"
              delay={0.4}
            />
          </>
        ) : (
          <>
            <StatCard
              label={t("clients") || "العملاء"}
              value={overview.clients}
              icon={<HandCoins className="h-6 w-6" />}
              gradient="from-violet-500 to-purple-600"
              glow="bg-violet-500/30"
              delay={0.15}
            />
            <StatCard
              label={t("revenue_month") || "إيراد الشهر"}
              value={fmtUsd(overview.orders.monthRevenue)}
              sub={`${overview.orders.thisMonth} ${t("orders") || "طلب"}`}
              icon={<BarChart3 className="h-6 w-6" />}
              gradient="from-emerald-500 to-teal-600"
              glow="bg-emerald-500/30"
              delay={0.2}
            />
          </>
        )}
      </section>

      {/* Quick actions + charts row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Quick actions */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">{t("quick_actions") || "تحكم سريع"}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {actions.map(({ to, icon: Icon, labelKey, gradient }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.04 }}
              >
                <Link
                  to={to}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-110",
                      gradient
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-center text-xs font-bold text-foreground">
                    {t(labelKey)}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Charts */}
        <section className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-border/50 bg-card/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                <h2 className="text-base font-bold">
                  {t("orders_last_7_days") || "الطلبات — آخر 7 أيام"}
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">
                {stats.chart.orderCounts.reduce((a: number, b: number) => a + b, 0)}{" "}
                {t("orders") || "طلب"}
              </span>
            </div>
            <MiniChart
              labels={stats.chart.labels}
              values={stats.chart.orderCounts}
              color="bg-gradient-to-t from-cyan-600 to-cyan-400"
              maxValue={Math.max(...stats.chart.orderCounts, 1)}
            />
          </div>

          {isAdmin && (
            <div className="rounded-2xl border border-border/50 bg-card/80 p-5">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold">
                  {t("revenue_last_7_days") || "الإيرادات — آخر 7 أيام"}
                </h2>
              </div>
              <MiniChart
                labels={stats.chart.labels}
                values={stats.chart.revenues}
                color="bg-gradient-to-t from-emerald-600 to-emerald-400"
                maxValue={chartMax}
              />
            </div>
          )}
        </section>
      </div>

      {/* Order status breakdown */}
      {statusItems.length > 0 && (
        <section className="rounded-2xl border border-border/50 bg-card/80 p-5">
          <h2 className="mb-4 text-base font-bold">
            {t("order_status_breakdown") || "توزيع حالات الطلبات"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {statusItems.map(({ key, label, count, color }) => {
              const total = overview.orders.total || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div
                  key={key}
                  className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl border border-border/40 bg-background/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge status={key} />
                    <span className="text-lg font-black tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all", color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {pct}% {label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent activity tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/50 bg-card/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">
              {t("recent_orders") || "آخر الطلبات"}
            </h2>
            <Link
              to={`/${dash}/orders`}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t("all") || "الكل"}
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("no_items")}
              </p>
            ) : (
              stats.recentOrders.map((order: DashboardRecentOrder) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/40 px-4 py-3 transition-colors hover:border-primary/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                    <ShoppingCart className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {order.product?.name || `#${order.id}`}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.user?.user_name || order.user?.email || "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-end">
                    <p className="text-sm font-black tabular-nums text-primary">
                      {fmtUsd(Number(order.total))}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {isAdmin && (
          <section className="rounded-2xl border border-border/50 bg-card/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {t("recent_charges") || "آخر الشحنات"}
              </h2>
              <Link
                to={`/${dash}/charges`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {t("all") || "الكل"}
              </Link>
            </div>
            <div className="space-y-2">
              {stats.recentCharges.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t("no_items")}
                </p>
              ) : (
                stats.recentCharges.map((charge: DashboardRecentCharge) => (
                  <div
                    key={charge.id}
                    className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/40 px-4 py-3 transition-colors hover:border-emerald-500/30"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Coins className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {charge.user?.user_name || charge.user?.email || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {moment(charge.created_at)
                          .locale(i18n.language)
                          .format("D MMM · HH:mm")}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-sm font-black tabular-nums text-emerald-400">
                        +{fmtUsd(Number(charge.coins))}
                      </p>
                      <StatusBadge status={charge.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
