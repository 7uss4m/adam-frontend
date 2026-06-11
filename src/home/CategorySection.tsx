import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";
import logo from "../assets/logo.webp";

function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}

function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  const [imgSrc, setImgSrc] = useState(cat.image || logo);

  return (
    <Link to={`/categories/${cat.id}/subs`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        viewport={{ once: true }}
        whileHover={{ y: -4, scale: 1.03 }}
        className="group relative overflow-hidden rounded-2xl border border-[#1a2a44] bg-[#0a1628] hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer"
      >
        {/* Shimmer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>

        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#0d1b2e] flex items-center justify-center p-4">
          <img
            src={imgSrc}
            alt={cat.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgSrc(logo)}
          />
        </div>

        {/* Label */}
        <div className="px-3 py-3 text-center border-t border-[#1a2a44]">
          <p className="text-sm font-bold text-white line-clamp-1">{cat.name}</p>
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

  const allCategories = useMemo(() => {
    const list = categoriesQuery.data || [];
    return list
      .filter((c) => c?.available !== false)
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order));
  }, [categoriesQuery.data]);

  const categories = allCategories.slice(0, 15);

  return (
    <section className="py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-black text-white">الأقسام الرئيسية</h2>
        </div>
        {allCategories.length > 15 && (
          <Link to="/categories">
            <motion.div
              whileHover={{ x: -4 }}
              className="text-sm text-cyan-400 font-semibold flex items-center gap-1 hover:text-cyan-300 transition-colors"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-4 h-4" />
            </motion.div>
          </Link>
        )}
      </motion.div>

      {/* Grid */}
      {categoriesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-[#1a2a44] bg-[#0a1628]">
              <div className="aspect-[16/10] animate-pulse bg-[#0d1b2e]" />
              <div className="px-3 py-3 border-t border-[#1a2a44]">
                <div className="h-3 w-3/4 mx-auto rounded animate-pulse bg-[#1a2a44]" />
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
        <div className="rounded-2xl border border-[#1a2a44] bg-[#0a1628] p-8 text-center text-sm text-gray-500">
          لا يوجد أقسام حالياً
        </div>
      )}
    </section>
  );
};

export default CategorySection;