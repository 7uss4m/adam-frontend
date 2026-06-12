import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronRight, ShoppingBag } from "lucide-react";
import getAds from "../api/getAds";
import type { Ad } from "../types/types";

type Slide = {
  id: string | number;
  image: string;
  title: string;
  description?: string;
};

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  const adsQuery = useQuery({
    queryKey: ["ads", "hero-banner"],
    queryFn: async () => {
      const res = await getAds();
      return res.data.result as Ad[];
    },
    refetchOnWindowFocus: false,
  });

  const slides: Slide[] = useMemo(() => {
    const ads = adsQuery.data || [];
    return ads
      .filter((a) => a?.active !== false && !!a?.image)
      .map((ad) => ({
        id: ad.id,
        image: String(ad.image),
        title: String(ad.title || ""),
        description: ad.description ? String(ad.description) : undefined,
      }));
  }, [adsQuery.data]);

  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (adsQuery.isLoading) {
    return (
      <div className="relative h-[220px] w-full overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#0a1628] to-[#050B14] sm:h-[340px] lg:h-[480px]">
        <div className="absolute inset-0 animate-pulse bg-muted/50" />
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="relative flex h-[220px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#0a1628] via-[#0d1b2e] to-[#050B14] sm:h-[340px] lg:h-[420px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-xl px-6 text-center"
        >
          <h1 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            متجرك الرقمي
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              الأول
            </span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            آلاف المنتجات الرقمية — تسليم فوري — أسعار تنافسية
          </p>
          <Link
            to="/categories"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25"
          >
            <ShoppingBag className="h-4 w-4" />
            ابدأ التسوق
          </Link>
        </motion.div>
      </div>
    );
  }

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent((p) => (p + 1) % slides.length);
  const slide = slides[current];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative h-[220px] w-full overflow-hidden rounded-3xl sm:h-[340px] lg:h-[480px]"
    >
      <div className="pointer-events-none absolute inset-0 z-20 rounded-3xl border border-border/80" />

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.55 }}
          className="absolute inset-0 h-full w-full"
        >
          <img
            src={slide.image}
            alt={slide.title || "banner"}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050B14]/95 via-[#050B14]/30 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#050B14]/50 via-transparent to-transparent" />

      {/* Content overlay */}
      <div className="absolute bottom-0 start-0 end-0 z-20 p-6 sm:p-10">
        <motion.div
          key={`text-${current}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-xl"
        >
          {slide.title && (
            <h2 className="text-xl font-black text-white sm:text-2xl lg:text-3xl">
              {slide.title}
            </h2>
          )}
          {slide.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground sm:text-base">
              {slide.description}
            </p>
          )}
          <Link
            to="/categories"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <ShoppingBag className="h-4 w-4" />
            تسوق الآن
          </Link>
        </motion.div>
      </div>

      {slides.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={prev}
            aria-label="السابق"
            className="absolute start-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2.5 text-white opacity-0 backdrop-blur-xl transition-all group-hover:opacity-100 sm:start-6 sm:p-3.5"
          >
            <ChevronRight className="h-5 w-5 rotate-180 sm:h-6 sm:w-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={next}
            aria-label="التالي"
            className="absolute end-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2.5 text-white opacity-0 backdrop-blur-xl transition-all group-hover:opacity-100 sm:end-6 sm:p-3.5"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>

          <div className="absolute bottom-5 start-1/2 z-30 flex -translate-x-1/2 gap-2 rounded-full border border-border/80 bg-black/30 px-4 py-2.5 backdrop-blur-xl sm:bottom-8">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "h-2.5 w-8 bg-gradient-to-r from-cyan-400 to-blue-500"
                    : "h-2.5 w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="absolute end-5 top-5 z-30 rounded-full border border-border/80 bg-black/30 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xl sm:end-8 sm:top-8">
            <span className="text-cyan-400">{current + 1}</span>
            <span className="mx-1 text-white/40">/</span>
            <span>{slides.length}</span>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default HeroBanner;
