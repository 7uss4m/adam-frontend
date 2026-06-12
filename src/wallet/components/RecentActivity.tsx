import { useMemo } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { ArrowDownLeft, ArrowUpRight, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Charge, Order } from "../../types/types";

type ActivityItem = {
  id: string;
  type: "payment" | "income";
  title: string;
  amount: number;
  date: string;
};

type RecentActivityProps = {
  orders?: Order[];
  income?: Charge[];
  limit?: number;
};

export default function RecentActivity({
  orders = [],
  income = [],
  limit = 8,
}: RecentActivityProps) {
  const [t, i18n] = useTranslation("global");

  const items = useMemo(() => {
    const list: ActivityItem[] = [];

    orders.forEach((o) => {
      list.push({
        id: `o-${o.id}`,
        type: "payment",
        title:
          o.price?.product?.name ||
          o.productName ||
          t("balance_charge") ||
          "شراء",
        amount: -Number(o.total || o.totalPrice || o.price?.price || 0),
        date: String(o.created_at),
      });
    });

    income.forEach((c) => {
      list.push({
        id: `c-${c.id}`,
        type: "income",
        title: t("income") || "شحن رصيد",
        amount: Number(c.coins || 0),
        date: String(c.created_at),
      });
    });

    return list
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [orders, income, limit, t]);

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-base font-semibold text-muted-foreground">{t("no_items")}</p>
        <Link
          to="/add-balance"
          className="mt-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20"
        >
          {t("charge_wallet") || "شحن المحفظة"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isIncome = item.amount > 0;
        const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;

        return (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-white/25"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isIncome
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-rose-500/15 text-rose-400"
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-white">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {moment(item.date).locale(i18n.language).format("D MMM · HH:mm")}
              </p>
            </div>
            <p
              className={`shrink-0 text-base font-black tabular-nums ${
                isIncome ? "text-emerald-400" : "text-white"
              }`}
            >
              {isIncome ? "+" : ""}
              {Math.abs(item.amount).toFixed(2)} $
            </p>
          </div>
        );
      })}

      <div className="flex gap-3 pt-2">
        <Link
          to="/wallet/payments"
          className="flex-1 rounded-xl border border-border bg-card py-3 text-center text-sm font-bold text-muted-foreground hover:border-cyan-500/40 hover:text-cyan-400"
        >
          {t("my_payments") || "كل الدفعات"}
        </Link>
        <Link
          to="/wallet/income"
          className="flex-1 rounded-xl border border-border bg-card py-3 text-center text-sm font-bold text-muted-foreground hover:border-cyan-500/40 hover:text-cyan-400"
        >
          {t("income") || "كل الشحنات"}
        </Link>
      </div>
    </div>
  );
}
