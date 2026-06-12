import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  ArrowDownCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type WalletNavTabsProps = {
  pathname: string;
  paymentsTotal?: string;
  incomeTotal?: string;
  debitTotal?: string;
};

export default function WalletNavTabs({
  pathname,
  paymentsTotal,
  incomeTotal,
  debitTotal,
}: WalletNavTabsProps) {
  const [t] = useTranslation("global");

  const tabs = [
    {
      to: "/wallet",
      icon: Wallet,
      label: t("balance") || "الرصيد",
      match: (p: string) => p === "/wallet",
    },
    {
      to: "/wallet/payments",
      icon: CreditCard,
      label: t("my_payments") || "دفعاتي",
      sub: paymentsTotal,
      match: (p: string) => p.startsWith("/wallet/payments"),
    },
    {
      to: "/wallet/income",
      icon: TrendingUp,
      label: t("income") || "الوارد",
      sub: incomeTotal,
      match: (p: string) => p.startsWith("/wallet/income"),
    },
    {
      to: "/wallet/debit",
      icon: ArrowDownCircle,
      label: t("debit_balance") || "رصيد الدين",
      sub: debitTotal,
      match: (p: string) => p.startsWith("/wallet/debit"),
    },
  ];

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
      {tabs.map(({ to, icon: Icon, label, sub, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-2xl border px-4 py-3 transition-all",
              active
                ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-300 shadow-md shadow-cyan-500/10"
                : "border-white/15 bg-[#1a2230] text-gray-300 hover:border-white/25 hover:text-white"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", active && "text-cyan-400")} />
            <div>
              <p className="whitespace-nowrap text-sm font-bold">{label}</p>
              {sub && (
                <p className="text-xs font-semibold tabular-nums opacity-90">{sub}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
