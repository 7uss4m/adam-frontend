import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import getAds from "../api/getAds";
import type { Ad } from "../types/types";

type Slide = {
  id: string | number;
  image: string;
  title: string;
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
      }));
  }, [adsQuery.data]);

  useEffect(() => { setCurrent(0); }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (adsQuery.isLoading) {
    return (
      <div className="w-full h-[200px] sm:h-[300px] lg:h-[420px] rounded-3xl animate-pulse bg-[#0a1628] border border-[#1a2a44]" />
    );
  }

  if (!slides.length) return null;

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent((p) => (p + 1) % slides.length);

  return (
    <div className="relative w-full h-[200px] sm:h-[300px] lg:h-[420px] rounded-3xl overflow-hidden group">

      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={slides[current].image}
          alt={slides[current].title || "banner"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </AnimatePresence>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="السابق"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="التالي"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
            {slides.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 h-2.5 bg-cyan-400"
                    : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
            <span className="text-xs font-bold text-white">{current + 1} / {slides.length}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default HeroBanner;