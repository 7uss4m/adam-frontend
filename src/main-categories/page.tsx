import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import getMainCategories from "../api/getMainCategories";
import getCategoriesByMainCategory from "../api/getCategoriesByMainCategory";
import type { Category, MainCategory } from "../types/types";
import CategoryCard from "../components/CategoryCard";

function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}

export default function MainCategoryCategoriesPage() {
  const { id } = useParams<{ id: string }>();

  const mainCategoriesQuery = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const res = await getMainCategories();
      return (res.data?.result ?? []) as MainCategory[];
    },
  });

  const currentMainCategory = useMemo(
    () => mainCategoriesQuery.data?.find((mc) => String(mc.id) === id),
    [mainCategoriesQuery.data, id]
  );

  const categoriesQuery = useQuery({
    queryKey: ["main-categories", id, "categories"],
    enabled: !!id,
    queryFn: async () => {
      const res = await getCategoriesByMainCategory(id as string);
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
      <div className="container max-w-[100%] md:max-w-[90%] lg:max-w-[80%] px-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Link to="/" className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-accent" />
          <h1 className="text-2xl font-black text-foreground">
            {currentMainCategory?.name ?? ""}
          </h1>
          {categories.length > 0 && (
            <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {categories.length}
            </span>
          )}
        </motion.div>

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
        ) : categories.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            لا يوجد أقسام حالياً
          </div>
        )}
      </div>
    </section>
  );
}
