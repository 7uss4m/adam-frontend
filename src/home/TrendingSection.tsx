import { useEffect, useState } from "react";
import logo from "../assets/logo.webp";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import getTrendingProducts from "../api/getTrendingProducts";
import type { Product } from "../types/types";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

interface TrendingProduct extends Product {
  image?: string;
}

export default function TrendingSection() {
  const { i18n } = useTranslation("global");
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token") || "";

  const [carouselRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
    align: "start",
    direction: i18n.language === "ar" ? "rtl" : "ltr",
  });

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const res = await getTrendingProducts(token);
        const data = (res.data?.result ?? res.data ?? []) as TrendingProduct[];
        setProducts(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTrending();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (!token || (!loading && products.length === 0)) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <h2 className="text-xl font-bold text-foreground">رائج الآن</h2>
      </div>

      {loading ? (
        <div className="overflow-hidden">
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shrink-0 basis-[60%] sm:basis-[36%] lg:basis-[22%]">
                <div className="aspect-square animate-pulse rounded-2xl bg-secondary" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div ref={carouselRef} className="overflow-hidden">
          <div className="flex gap-4">
            {products.map((product, i) => (
              <div
                key={product.id}
                className={cn("shrink-0", "basis-[60%] sm:basis-[36%] lg:basis-[22%]")}
              >
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  viewport={{ once: true }}
                  className="select-none h-full"
                >
                  <Link
                    to={`/categories/${product.categoryId}/subs/${product.categoryId}/product/${product.id}`}
                    className="block h-full overflow-hidden rounded-2xl border border-white/5 bg-card transition-transform hover:scale-105"
                  >
                    <div className="aspect-square w-full bg-secondary">
                      <img
                        src={product.image || logo}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        draggable={false}
                        onError={(e) => { (e.target as HTMLImageElement).src = logo; }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-sm font-bold text-foreground">
                        {product.name}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}