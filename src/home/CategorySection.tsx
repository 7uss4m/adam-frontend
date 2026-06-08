import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  return (
    <Link to={`/categories/${cat.id}/subs`}>
      <motion.button
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.03 }}
        className="group relative aspect-square size-full overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30 "
      >
        <img
          src={cat.image}
          alt={cat.name}
          className="absolute inset-0 size-full aspect-square object-fill rounded-xl transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 rounded-xl via-black/25 to-transparent" />
        <div className="absolute bottom-3 left-0 right-0 px-2 text-center">
          <span className="text-sm font-bold text-white drop-shadow-lg line-clamp-1">
            {cat.name}
          </span>
        </div>
      </motion.button>
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

  const [, i18n] = useTranslation("global");

  const categories = useMemo(() => {
    const list = categoriesQuery.data || [];
    return list
      .filter((c) => c?.available !== false)
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order));
  }, [categoriesQuery.data]);

  // Mobile: 2 rows x 2 cols per slide => 4 items per slide
  // const pagesMobile = useMemo(() => chunk(categories, 4), [categories]);

  // Large: 1 row x 6 cols per slide => 6 items per slide
  const pagesLg = useMemo(() => chunk(categories, 6), [categories]);

  const autoplay = useRef(
    Autoplay({
      delay: 3500,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    })
  );

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="font-orbitron text-xl font-bold text-foreground">
          تصفح الأقسام
        </h2>
      </div>

      {categoriesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[140px] animate-pulse rounded-xl bg-secondary"
            />
          ))}
        </div>
      ) : categories.length ? (
        <div className="relative">
          {/* ✅ Mobile/Tablet: 2 rows x 2 cols per slide + controls */}
          <div className="lg:hidden">
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat, i) => (
                <CategoryCard key={cat.id} cat={cat} index={i} />
              ))}
            </div>
          </div>

          {/* ✅ Large screens (lg+): 1 row x 6 cols per slide + controls */}
          <div className="hidden lg:block">
            <Carousel
              opts={{
                loop: true,
                align: "start",
                direction: i18n.language === "ar" ? "rtl" : "ltr",
              }}
              plugins={[autoplay.current]}
              className="w-full"
              onMouseEnter={() => autoplay.current.stop()}
              onMouseLeave={() => autoplay.current.play()}
            >
              <CarouselContent>
                {pagesLg.map((page, pageIndex) => (
                  <CarouselItem key={pageIndex} className="basis-full">
                    <div className="grid grid-cols-6 gap-4">
                      {page.map((cat, i) => (
                        <CategoryCard
                          key={cat.id}
                          cat={cat}
                          index={pageIndex * 6 + i}
                        />
                      ))}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur border-border hover:bg-background z-20" />
              <CarouselNext className="right-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur border-border hover:bg-background z-20" />
            </Carousel>
          </div>
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
