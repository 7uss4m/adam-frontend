import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";

function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}

function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  return (
    <Link to={`/categories/${cat.id}/subs`}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.03 }}
        className="group relative aspect-square overflow-hidden rounded-2xl border border-white/5 bg-card"
      >
        <img
          src={cat.image}
          alt={cat.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
          <span className="text-sm font-bold text-white drop-shadow-lg line-clamp-1">
            {cat.name}
          </span>
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
    <section className="py-8">
      <h2 className="mb-5 text-xl font-bold text-foreground">الأقسام</h2>

      {categoriesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-secondary"
            />
          ))}
        </div>
      ) : categories.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-secondary p-6 text-sm text-muted-foreground">
          لا يوجد أقسام حالياً
        </div>
      )}
    </section>
  );
};

export default CategorySection;
