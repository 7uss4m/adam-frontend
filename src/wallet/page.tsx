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
import { Wallet as WalletIcon, ArrowRight, CreditCard, TrendingUp } from "lucide-react";

// helpers
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
  return `${(n as number).toFixed(2)} USD`;
}

export default function Wallet() {
  // translation
  const [t, i18n] = useTranslation("global");

  // location
  const { pathname, search } = useLocation();

  // params
  const params = new URLSearchParams(search);
  const filter = params.get("filter") || "all";

  // navigate
  const navigate = useNavigate();

  // state
  const [totalPayments, setTotalPayments] = useState<number | undefined>(undefined);
  const [totalIncome, setTotalIncome] = useState<number | undefined>(undefined);

  // query
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

  // totals
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

  const cards = useMemo(() => {
    const bal = getUserQuery.data?.balance ?? 0;

    return [
      {
        to: "/wallet",
        active: pathname === "/wallet",
        icon: WalletIcon,
        label: t("balance"),
        value: fmtUsd(Number(bal)),
      },
      {
        to: "/wallet/payments",
        active: pathname === "/wallet/payments",
        icon: CreditCard,
        label: t("my_payments"),
        value: fmtUsd(totalPayments),
      },
      {
        to: "/wallet/income",
        active: pathname === "/wallet/income",
        icon: TrendingUp,
        label: t("income"),
        value: totalIncome != null ? `${totalIncome} USD` : "",
      },
      {
        to: "/wallet/debit",
        active: pathname === "/wallet/debit",
        icon: ArrowRight, // just an icon; you can change
        label: t("debit_balance"),
        value: `${getUserDeptQuery.data?.coins ? getUserDeptQuery.data?.coins : 0} USD`,
      },
    ];
  }, [
    pathname,
    t,
    getUserQuery.data?.balance,
    totalPayments,
    totalIncome,
    getUserDeptQuery.data?.coins,
  ]);

  return (
    <>
      {loading ? (
        <div className="min-h-[85vh] flex items-center justify-center">
          <Spinner />
        </div>
      ) : isAuthed ? (
        <div
          className="min-h-svh bg-background"
          dir={i18n.language === "ar" ? "rtl" : "ltr"}
        >
          <main className="container mx-auto px-4 py-8">
            {/* Header (V2-ish) */}
            <div className="mb-8 flex items-center gap-3">
              <WalletIcon className="h-7 w-7 text-primary" />
              <h1 className="font-orbitron text-2xl font-bold text-foreground">
                {t("my_wallet")}
              </h1>
            </div>

            {/* Stat cards (V2-ish) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {cards.map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.to}
                    to={c.to}
                    className={[
                      "group rounded-xl border bg-card p-4 transition-colors",
                      "hover:border-primary/30",
                      c.active ? "border-primary/40" : "border-border",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>

                      {/* tiny active hint */}
                      {c.active ? (
                        <span className="text-[10px] font-semibold text-primary">
                          {t("active") || ""}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <p className="font-orbitron text-sm font-black text-foreground">
                        {c.value}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        {c.label}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Filter row */}
            <div className="mt-6 flex items-center gap-3">
              <FaFilter className="text-primary" />
              <Select
                value={filter}
                onValueChange={(value) => {
                  const next = new URLSearchParams(search);
                  next.set("filter", value);
                  navigate({ search: next.toString() }, { replace: true });
                }}
              >
                <SelectTrigger className="w-full max-w-[260px] bg-card text-foreground rounded-lg border border-border">
                  <SelectValue placeholder={getPlaceholderText(filter, t)} />
                </SelectTrigger>
                <SelectContent className="bg-card text-foreground">
                  <SelectItem className="capitalize" value="today">
                    {t("today")}
                  </SelectItem>
                  <SelectItem className="capitalize" value="7">
                    {t("last_7_days")}
                  </SelectItem>
                  <SelectItem className="capitalize" value="30">
                    {t("last_30_days")}
                  </SelectItem>
                  <SelectItem className="capitalize" value="all">
                    {t("all")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Body */}
            <div className="mt-6">
              {pathname === "/wallet" ? (
                <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20">
                  <WalletIcon className="h-16 w-16 text-muted-foreground/40" />
                  <p className="text-lg text-muted-foreground">{t("no_items")}</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-2 flex items-center gap-2 rounded-lg gradient-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
                  >
                    {t("browse_products") || "تصفح المنتجات"}
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              ) : (
                <Outlet
                  context={{
                    orders: getUserPaymentsQuery.data,
                    income: getUserIncomeQuery.data,
                  }}
                />
              )}
            </div>
          </main>
        </div>
      ) : (
        <section className="min-h-[85vh] flex items-center justify-center">
          <p className="text-xl text-accent">{t("login_first")}</p>
        </section>
      )}
    </>
  );
}