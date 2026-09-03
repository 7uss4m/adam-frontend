import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";
import CategoryCard from "../components/CategoryCard";

function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["categories", "all"],
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
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order))
      .filter((c) => !search.trim() || c.name.includes(search.trim()));
  }, [categoriesQuery.data, search]);

  return (
    <section className="py-10">
      <div className="container max-w-[100%] md:max-w-[90%] lg:max-w-[80%] px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Link to="/" className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-accent" />
          <h1 className="text-2xl font-black text-foreground">كل الأقسام</h1>
          {categories.length > 0 && (
            <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {categories.length}
            </span>
          )}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8"
        >
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن قسم..."
            className="w-full rounded-xl border border-primary/20 bg-secondary/40 backdrop-blur-sm px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </motion.div>

        {/* Grid */}
        {categoriesQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/5">
                <div className="aspect-square animate-pulse bg-secondary" />
                <div className="px-3 py-3">
                  <div className="h-3 w-2/3 mx-auto rounded animate-pulse bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} cat={cat} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
