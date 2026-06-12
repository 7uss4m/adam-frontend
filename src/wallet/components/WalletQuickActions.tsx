import { Link } from "react-router-dom";
import { ShoppingBag, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const ACTIONS = [
  {
    to: "/orders",
    icon: ShoppingBag,
    labelKey: "my_orders",
    fallback: "طلباتي",
    color: "from-blue-500 to-cyan-600",
  },
  {
    to: "/wallet/payments",
    icon: TrendingUp,
    labelKey: "my_payments",
    fallback: "دفعاتي",
    color: "from-violet-500 to-purple-600",
  },
];

export default function WalletQuickActions() {
  const [t] = useTranslation("global");

  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map(({ to, icon: Icon, labelKey, fallback, color }) => (
        <Link
          key={to}
          to={to}
          className="group flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-[#1a2230] p-5 transition-all hover:border-cyan-500/40 hover:bg-[#1f2838]"
        >
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg transition-transform group-hover:scale-110`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <span className="text-center text-sm font-bold text-gray-200 group-hover:text-white">
            {t(labelKey) || fallback}
          </span>
        </Link>
      ))}
    </div>
  );
}
