import { useEffect, useMemo, useState, useCallback } from "react";
import logo from "../assets/logo.webp";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Crown, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import getAllProducts from "../api/getAllProducts";
import useEmblaCarousel from "embla-carousel-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  badge: string | null;
  instant_delivery: boolean | null;
  available?: boolean | number | null;
  image?: string;
}

interface ProductsGridProps {
  title: string;
  subtitle?: string;
}

function isAvailable(v: Product["available"]) {
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string")
    return v === "1" || (v as string)?.toLowerCase() === "true";
  return true;
}

export default function ProductsGrid({ title, subtitle }: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem("token") || "", []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
    align: "start",
    direction: "rtl",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getAllProducts(token);
        const list = (res.data?.result ?? res.data ?? []) as Product[];
        const filtered = Array.isArray(list)
          ? list.filter((p) => isAvailable(p.available))
          : [];
        if (mounted) setProducts(filtered);
      } catch {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <section className="py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h2 className="text-lg font-black text-white">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        <Link to="/categories">
          <motion.div
            whileHover={{ x: -4 }}
            className="text-sm text-cyan-400 font-semibold flex items-center gap-1 hover:text-cyan-300 transition-colors"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-4 h-4" />
          </motion.div>
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-[#1a2a44] bg-[#0a1628]">
              <div className="aspect-[4/3] animate-pulse bg-[#0d1b2e]" />
              <div className="p-3.5 space-y-2.5">
                <div className="h-3 w-2/3 mx-auto rounded animate-pulse bg-[#1a2a44]" />
                <div className="h-3 w-1/2 mx-auto rounded animate-pulse bg-[#1a2a44]" />
                <div className="h-8 w-full rounded-xl animate-pulse bg-[#1a2a44]" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-[#1a2a44] bg-[#0a1628] p-10 text-center text-sm text-gray-500">
          لا توجد منتجات حالياً
        </div>
      ) : (
        <div className="relative group/carousel">
          {/* Carousel */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-4">
              {products.slice(0, 12).map((product, i) => (
                <div
                  key={product.id}
                  className="shrink-0 basis-[48%] sm:basis-[32%] lg:basis-[24%] xl:basis-[16.5%]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    viewport={{ once: true }}
                  >
                    <Link to={`/product/${product.id}`}>
                      <ProductCard
                        name={product.name}
                        category={product.category}
                        price={product.price}
                        originalPrice={product.original_price ?? undefined}
                        image={product.image || logo}
                        badge={product.badge ?? undefined}
                        instant={product.instant_delivery ?? false}
                        index={i}
                      />
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            type="button"
            title="السابق"
            onClick={scrollPrev}
            className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 p-2 rounded-full bg-[#0a1628]/90 border border-[#1a2a44] text-white hover:border-cyan-500/50 hover:bg-[#0a1628] transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            title="التالي"
            onClick={scrollNext}
            className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 p-2 rounded-full bg-[#0a1628]/90 border border-[#1a2a44] text-white hover:border-cyan-500/50 hover:bg-[#0a1628] transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}