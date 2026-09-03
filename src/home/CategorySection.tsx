import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";
import CategoryCard from "../components/CategoryCard";
import SectionHeader from "./SectionHeader";
import { safeOrder } from "./home-utils";

export default function CategorySection() {
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
    <section className="py-4">
      <SectionHeader
        icon={Sparkles}
        title="الأقسام"
        subtitle="تصفّح حسب نوع المنتج"
        viewAllHref="/categories"
        accent="text-cyan-400"
      />

      {categoriesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border"
            >
              <div className="aspect-square animate-pulse bg-secondary" />
              <div className="px-3 py-3">
                <div className="mx-auto h-3 w-2/3 animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          لا يوجد أقسام حالياً
        </div>
      )}
    </section>
  );
}
