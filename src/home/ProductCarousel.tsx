import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import getProductsPaginated, {
  ProductsPaginatedParams,
} from "../api/getProductsPaginated";
import { Product } from "../types/types";
import ProductCard from "./ProductCard";
import SectionHeader from "./SectionHeader";

type ProductCarouselProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  viewAllHref?: string;
  accent?: string;
  params?: ProductsPaginatedParams;
  limit?: number;
};

export default function ProductCarousel({
  title,
  subtitle,
  icon,
  viewAllHref = "/categories",
  accent = "text-cyan-400",
  params = { status: "active", sort: "order_asc" },
  limit = 12,
}: ProductCarouselProps) {
  const { i18n } = useTranslation("global");
  const token = localStorage.getItem("token") || "";

  const productsQuery = useQuery({
    queryKey: ["home-products", title, params, limit],
    queryFn: async () => {
      const res = await getProductsPaginated(token, {
        ...params,
        page: 1,
        limit,
      });
      return res.data.result as Product[];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
    align: "start",
    direction: i18n.language === "ar" ? "rtl" : "ltr",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const products = productsQuery.data ?? [];

  if (!productsQuery.isLoading && products.length === 0) return null;

  return (
    <section className="py-2">
      <SectionHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        viewAllHref={viewAllHref}
        accent={accent}
      />

      {productsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-[4/3] animate-pulse bg-muted" />
              <div className="space-y-2.5 p-4">
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#1a2a44]" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#1a2a44]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="group/carousel relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-4">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="shrink-0 basis-[72%] sm:basis-[46%] md:basis-[32%] lg:basis-[24%] xl:basis-[18%]"
                >
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          </div>

          {products.length > 4 && (
            <>
              <button
                type="button"
                title="السابق"
                onClick={scrollPrev}
                className="absolute -end-1 top-[42%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground opacity-0 shadow-xl backdrop-blur-md transition-all hover:border-cyan-500/50 group-hover/carousel:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                title="التالي"
                onClick={scrollNext}
                className="absolute -start-1 top-[42%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground opacity-0 shadow-xl backdrop-blur-md transition-all hover:border-cyan-500/50 group-hover/carousel:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
