import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, Tag, ToggleRight, Users } from "lucide-react";
import getProductStats from "../api/getProductStats";

const STAT_ITEMS = [
  { key: "total" as const, icon: Package, label: "منتج", color: "text-cyan-400", bg: "from-cyan-500/20" },
  { key: "active" as const, icon: ToggleRight, label: "متاح", color: "text-emerald-400", bg: "from-emerald-500/20" },
  { key: "withOffers" as const, icon: Tag, label: "عرض", color: "text-rose-400", bg: "from-rose-500/20" },
  { key: "categories" as const, icon: Users, label: "قسم", color: "text-violet-400", bg: "from-violet-500/20" },
];

export default function PlatformStats({ categoryCount = 0 }: { categoryCount?: number }) {
  const token = localStorage.getItem("token") || "";

  const statsQuery = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const res = await getProductStats(token);
      return res.data.result;
    },
    staleTime: 120_000,
    refetchOnWindowFocus: false,
  });

  const stats = statsQuery.data;

  if (statsQuery.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#0a1628] border border-[#1a2a44]" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const values = {
    total: stats.total,
    active: stats.active,
    withOffers: stats.withOffers,
    categories: categoryCount,
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {STAT_ITEMS.map(({ key, icon: Icon, label, color, bg }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }}
          viewport={{ once: true }}
          className={`relative overflow-hidden rounded-2xl border border-[#1a2a44]/60 bg-gradient-to-br ${bg} to-transparent p-4 backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-black tabular-nums text-white sm:text-3xl`}>
                {values[key].toLocaleString()}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">{label}</p>
            </div>
            <Icon className={`h-8 w-8 opacity-80 ${color}`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
