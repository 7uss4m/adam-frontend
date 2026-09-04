import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import getMainCategories from "../api/getMainCategories";
import type { MainCategory } from "../types/types";
import MainCategoryCard from "../components/MainCategoryCard";
import SectionHeader from "./SectionHeader";
import { safeOrder } from "./home-utils";

export default function CategorySection() {
  const mainCategoriesQuery = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const res = await getMainCategories();
      return (res.data?.result ?? []) as MainCategory[];
    },
    refetchOnWindowFocus: false,
  });

  const mainCategories = useMemo(() => {
    const list = mainCategoriesQuery.data || [];
    return list
      .filter((mc) => mc?.active !== false)
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order));
  }, [mainCategoriesQuery.data]);

  return (
    <section id="categories" className="py-4">
      <SectionHeader
        icon={Sparkles}
        title="الأقسام"
        subtitle="تصفّح حسب نوع المنتج"
        accent="text-cyan-400"
      />

      {mainCategoriesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
      ) : mainCategories.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {mainCategories.map((mc) => (
            <MainCategoryCard key={mc.id} mc={mc} />
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
