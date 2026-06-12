import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  ShoppingBag,
  PlusCircle,
  Crown,
  Code2,
  Bell,
} from "lucide-react";
import getUser from "../api/getUser";
import { User } from "../types/types";

const QUICK_LINKS = [
  {
    href: "/add-balance",
    icon: PlusCircle,
    label: "شحن الرصيد",
    sub: "أضف رصيداً فوراً",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    href: "/orders",
    icon: ShoppingBag,
    label: "طلباتي",
    sub: "تتبع مشترياتك",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    href: "/wallet/payments",
    icon: Wallet,
    label: "محفظتي",
    sub: "الرصيد والدفعات",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    href: "/api",
    icon: Code2,
    label: "API",
    sub: "ربط برمجي",
    gradient: "from-amber-500 to-orange-600",
  },
];

export default function QuickAccessBar() {
  const token = localStorage.getItem("token");

  const userQuery = useQuery({
    queryKey: ["user", "home"],
    queryFn: async () => {
      const res = await getUser(token as string);
      return res.data.result as User;
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  if (!token) return null;

  const user = userQuery.data;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-[#1a2a44]/80 bg-gradient-to-br from-[#0a1628] via-[#0d1b2e] to-[#0a1628] p-5 shadow-xl sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500/80">
            مرحباً بعودتك
          </p>
          <h2 className="mt-1 text-lg font-black text-white sm:text-xl">
            {user?.user_name || user?.email || "مستخدم"}
          </h2>
          {user?.level?.name && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
              <Crown className="h-3.5 w-3.5" />
              {user.level.name}
              {user.level.profit > 0 && (
                <span className="text-amber-500/70">· خصم {user.level.profit}%</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400/80">
              رصيدك
            </p>
            <p className="text-2xl font-black tabular-nums text-emerald-400">
              ${Number(user?.balance ?? 0).toFixed(2)}
            </p>
          </div>
          <Link
            to="/notifications"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1a2a44] bg-[#050B14]/60 text-gray-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
          >
            <Bell className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_LINKS.map(({ href, icon: Icon, label, sub, gradient }, i) => (
          <Link key={href} to={href}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="group flex items-center gap-3 rounded-2xl border border-[#1a2a44]/60 bg-[#050B14]/40 p-3.5 transition-all hover:border-cyan-500/30 hover:bg-[#050B14]/70"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="truncate text-[10px] text-gray-500">{sub}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
