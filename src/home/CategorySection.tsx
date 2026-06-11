import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";

function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}

const CARD_GRADIENTS = [
  "from-violet-500/20 via-purple-500/10 to-transparent",
  "from-cyan-500/20 via-blue-500/10 to-transparent",
  "from-rose-500/20 via-pink-500/10 to-transparent",
  "from-amber-500/20 via-orange-500/10 to-transparent",
  "from-emerald-500/20 via-teal-500/10 to-transparent",
  "from-sky-500/20 via-indigo-500/10 to-transparent",
  "from-fuchsia-500/20 via-pink-500/10 to-transparent",
  "from-lime-500/20 via-green-500/10 to-transparent",
];

const GLOW_COLORS = [
  "group-hover:shadow-violet-500/30",
  "group-hover:shadow-cyan-500/30",
  "group-hover:shadow-rose-500/30",
  "group-hover:shadow-amber-500/30",
  "group-hover:shadow-emerald-500/30",
  "group-hover:shadow-sky-500/30",
  "group-hover:shadow-fuchsia-500/30",
  "group-hover:shadow-lime-500/30",
];

const BORDER_COLORS = [
  "group-hover:border-violet-500/60",
  "group-hover:border-cyan-500/60",
  "group-hover:border-rose-500/60",
  "group-hover:border-amber-500/60",
  "group-hover:border-emerald-500/60",
  "group-hover:border-sky-500/60",
  "group-hover:border-fuchsia-500/60",
  "group-hover:border-lime-500/60",
];

function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const glow = GLOW_COLORS[index % GLOW_COLORS.length];
  const border = BORDER_COLORS[index % BORDER_COLORS.length];

  return (
    <Link to={`/categories/${cat.id}/subs`}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.05, duration: 0.5 }}
        viewport={{ once: true }}
        whileHover={{ y: -6, scale: 1.03 }}
        className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} backdrop-blur-sm transition-all duration-400 shadow-lg ${glow} hover:shadow-xl ${border} cursor-pointer`}
      >
        {/* Background shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={cat.image}
            alt={cat.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
            loading="lazy"
          />
          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Arrow icon top right */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ArrowLeft className="w-4 h-4 text-white rotate-180" />
          </motion.div>
        </div>

        {/* Label */}
        <div className="px-3 py-3">
          <p className="text-sm font-bold text-white line-clamp-1 text-center tracking-wide drop-shadow">
            {cat.name}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

const CategorySection = () => {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      return (res.data?.result ?? res.data) as Category[];
    },
    refetchOnWindowFocus: false,
  });

  const categories = useMemo(() => {
    const list = categoriesQuery.data || [];
    return list
      .filter((c) => c?.available !== false)
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order));
  }, [categoriesQuery.data]);

  return (
    <section className="py-10">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-7"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-accent" />
          <h2 className="text-xl font-black text-foreground tracking-tight">الأقسام</h2>
          {categories.length > 0 && (
            <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {categories.length}
            </span>
          )}
        </div>
        <motion.div whileHover={{ x: -4 }} className="text-sm text-primary font-semibold flex items-center gap-1 cursor-pointer">
          <span>عرض الكل</span>
          <ArrowLeft className="w-4 h-4" />
        </motion.div>
      </motion.div>

      {/* Grid */}
      {categoriesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-secondary/50">
              <div className="aspect-square animate-pulse bg-secondary" />
              <div className="px-3 py-3">
                <div className="h-3 w-3/4 mx-auto rounded animate-pulse bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
          لا يوجد أقسام حالياً
        </div>
      )}
    </section>
  );
};

export default CategorySection;
