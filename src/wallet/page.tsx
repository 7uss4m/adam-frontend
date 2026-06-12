/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaFilter } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useQuery } from "@tanstack/react-query";
import getUser from "../api/getUser";
import type { Charge, Dept, Order, User } from "../types/types";
import Spinner from "../components/Spinner";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import getUserPayments from "../api/getUserPayments";
import getUserIncome from "../api/getUserIncome";
import { useEffect, useMemo, useState } from "react";
import getUserDepit from "../api/getUserDepit";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Copy, Check } from "lucide-react";

import BalanceCard from "./components/BalanceCard";
import WalletQuickActions from "./components/WalletQuickActions";
import WalletNavTabs from "./components/WalletNavTabs";
import RecentActivity from "./components/RecentActivity";
import WalletMobileNav from "./components/WalletMobileNav";

const getPlaceholderText = (filter: string, t: (k: string) => string) => {
  switch (filter) {
    case "7":
      return t("last_7_days") || "Last 7 days";
    case "30":
      return t("last_30_days") || "Last 30 days";
    case "all":
      return t("all") || "All";
    case "today":
      return t("today") || "Today";
    default:
      return t("filter") || "Filter";
  }
};

function fmtUsd(n?: number) {
  if (!Number.isFinite(n as number)) return "";
  return `$${(n as number).toFixed(2)}`;
}

export default function Wallet() {
  const [t, i18n] = useTranslation("global");
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const filter = params.get("filter") || "all";

  const [totalPayments, setTotalPayments] = useState<number | undefined>(undefined);
  const [totalIncome, setTotalIncome] = useState<number | undefined>(undefined);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const getUserQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await getUser(localStorage.getItem("token") as string);
      return response.data.result as User;
    },
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const getUserPaymentsQuery = useQuery({
    queryKey: ["user payments"],
    queryFn: async () => {
      const response = await getUserPayments(localStorage.getItem("token") as string);
      return response.data.result as Order[];
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  const getUserIncomeQuery = useQuery({
    queryKey: ["user income"],
    queryFn: async () => {
      const response = await getUserIncome(localStorage.getItem("token") as string);
      return response.data.result as Charge[];
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  const getUserDeptQuery = useQuery({
    queryKey: ["user dept"],
    queryFn: async () => {
      const response = await getUserDepit(localStorage.getItem("token") as string);
      return response.data.result as Dept;
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    let tp = 0;
    let ti = 0;

    if (!getUserPaymentsQuery.isLoading) {
      getUserPaymentsQuery.data?.forEach((order) => {
        if (order?.price) tp += Number(order.total || 0);
      });
      setTotalPayments(tp);
    }

    if (!getUserIncomeQuery.isLoading) {
      getUserIncomeQuery.data?.forEach((income) => {
        ti += parseInt(String(income.coins || "0"), 10) || 0;
      });
      setTotalIncome(ti);
    }
  }, [
    getUserIncomeQuery.data,
    getUserIncomeQuery.isLoading,
    getUserPaymentsQuery.data,
    getUserPaymentsQuery.isLoading,
  ]);

  const loading =
    getUserQuery.isLoading ||
    getUserPaymentsQuery.isLoading ||
    getUserDeptQuery.isLoading;

  const isAuthed = getUserQuery.isSuccess && !!getUserQuery.data;
  const user = getUserQuery.data;
  const isMainWallet = pathname === "/wallet";

  const monthSpent = useMemo(() => {
    const orders = getUserPaymentsQuery.data || [];
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return orders
      .filter((o) => new Date(o.created_at) >= start)
      .reduce((s, o) => s + Number(o.total || 0), 0);
  }, [getUserPaymentsQuery.data]);

  const copyInviteCode = async () => {
    if (!user?.invite_code) return;
    await navigator.clipboard.writeText(user.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!isAuthed || !user) {
    return (
      <section className="flex min-h-[85vh] items-center justify-center bg-background">
        <p className="text-xl text-cyan-400">{t("login_first")}</p>
      </section>
    );
  }

  return (
    <div
      className="min-h-svh bg-background pb-24 md:pb-10"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header — matches mobile mockup */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex max-w-lg items-center justify-between px-4 py-4 sm:max-w-2xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {t("my_wallet") || "المحفظة"}
          </h1>
          <div className="w-10" />
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
      </header>

      <main className="container mx-auto max-w-lg space-y-6 px-4 py-6 sm:max-w-2xl">
        {/* Hero balance card */}
        <BalanceCard
          user={user}
          hidden={balanceHidden}
          onToggleHidden={() => setBalanceHidden((v) => !v)}
        />

        {/* Invite code */}
        {user.invite_code && (
          <button
            type="button"
            onClick={copyInviteCode}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-start transition-colors hover:border-cyan-500/40"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("invite_code") || "رمز الدعوة"}
              </p>
              <p className="font-mono text-base font-bold text-cyan-400">
                {user.invite_code}
              </p>
            </div>
            {copiedCode ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: t("my_payments") || "إجمالي الدفعات",
              value: fmtUsd(totalPayments),
              accent: "text-cyan-400",
            },
            {
              label: t("income") || "إجمالي الشحن",
              value: fmtUsd(totalIncome),
              accent: "text-emerald-400",
            },
            {
              label: t("month_spending") || "مصروفات الشهر",
              value: fmtUsd(monthSpent),
              accent: "text-amber-400",
            },
            {
              label: t("debit_balance") || "الدين",
              value: fmtUsd(Number(getUserDeptQuery.data?.coins || 0)),
              accent: "text-rose-400",
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <p className={`text-xl font-black tabular-nums sm:text-2xl ${accent}`}>
                {value}
              </p>
              <p className="mt-1.5 text-xs font-semibold leading-snug text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <WalletQuickActions />

        {/* Section tabs */}
        <WalletNavTabs
          pathname={pathname}
          paymentsTotal={fmtUsd(totalPayments)}
          incomeTotal={fmtUsd(totalIncome)}
          debitTotal={fmtUsd(Number(getUserDeptQuery.data?.coins || 0))}
        />

        {/* Filter — sub-pages */}
        {!isMainWallet && !pathname.startsWith("/wallet/debit") && (
          <div className="flex items-center gap-3">
            <FaFilter className="text-cyan-400" />
            <Select
              value={filter}
              onValueChange={(value) => {
                const next = new URLSearchParams(search);
                next.set("filter", value);
                navigate({ search: next.toString() }, { replace: true });
              }}
            >
              <SelectTrigger className="w-full max-w-[260px] rounded-xl border-border/80 bg-card text-white">
                <SelectValue placeholder={getPlaceholderText(filter, t)} />
              </SelectTrigger>
              <SelectContent className="bg-card text-white">
                <SelectItem value="today">{t("today")}</SelectItem>
                <SelectItem value="7">{t("last_7_days")}</SelectItem>
                <SelectItem value="30">{t("last_30_days")}</SelectItem>
                <SelectItem value="all">{t("all")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Body */}
        {isMainWallet ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {t("history") || "آخر الحركات"}
              </h2>
              <Link
                to="/wallet/payments"
                className="text-xs font-semibold text-cyan-400"
              >
                {t("all") || "الكل"}
              </Link>
            </div>
            <RecentActivity
              orders={getUserPaymentsQuery.data}
              income={getUserIncomeQuery.data}
            />
          </section>
        ) : (
            <Outlet
            context={{
              orders: getUserPaymentsQuery.data,
              income: getUserIncomeQuery.data,
              dept: getUserDeptQuery.data,
            }}
          />
        )}
      </main>

      <WalletMobileNav />
    </div>
  );
}
