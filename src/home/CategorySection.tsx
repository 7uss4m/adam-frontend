import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";
import logo from "../assets/logo.webp";
import SectionHeader from "./SectionHeader";
import { safeOrder } from "./home-utils";

const CARD_GRADIENTS = [
  "from-cyan-500/15 via-blue-500/5 to-transparent",
  "from-violet-500/15 via-purple-500/5 to-transparent",
  "from-rose-500/15 via-pink-500/5 to-transparent",
  "from-amber-500/15 via-orange-500/5 to-transparent",
  "from-emerald-500/15 via-teal-500/5 to-transparent",
  "from-sky-500/15 via-indigo-500/5 to-transparent",
];

function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  const [imgSrc, setImgSrc] = useState(cat.image || logo);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <Link to={`/categories/${cat.id}/subs`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.4 }}
        viewport={{ once: true }}
        whileHover={{ y: -6, scale: 1.03 }}
        className={`group relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br ${gradient} from-[#0a1628] to-[#0a1628] shadow-lg transition-all duration-300 hover:border-cyan-500/40 hover:shadow-cyan-500/10`}
      >
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </div>

        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/50 p-4">
          <img
            src={imgSrc}
            alt={cat.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgSrc(logo)}
          />
        </div>

        <div className="border-t border-border/60 px-3 py-3 text-center">
          <p className="line-clamp-1 text-sm font-bold text-foreground">{cat.name}</p>
        </div>
      </motion.div>
    </Link>
  );
}

export default function CategorySection() {
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

  const categories = allCategories.slice(0, 12);

  return (
    <section className="py-4">
      <SectionHeader
        icon={Sparkles}
        title="الأقسام الرئيسية"
        subtitle="تصفّح حسب نوع المنتج"
        viewAllHref="/categories"
        accent="text-cyan-400"
      />

      {categoriesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-[4/3] animate-pulse bg-muted" />
              <div className="border-t border-border px-3 py-3">
                <div className="mx-auto h-3 w-3/4 animate-pulse rounded-full bg-[#1a2a44]" />
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
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          لا يوجد أقسام حالياً
        </div>
      )}

      {allCategories.length > 12 && (
        <div className="mt-6 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-2xl border border-border px-6 py-2.5 text-sm font-semibold text-cyan-400 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/5"
          >
            عرض كل الأقسام ({allCategories.length})
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
