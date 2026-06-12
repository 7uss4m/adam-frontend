import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Play } from "lucide-react";
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
      <div className="w-full h-[200px] sm:h-[320px] lg:h-[460px] rounded-3xl animate-pulse bg-gradient-to-br from-[#0a1628] to-[#050B14] border border-[#1a2a44] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_25%,rgba(6,182,212,0.1)_50%,transparent_50%,transparent_75%,rgba(6,182,212,0.1)_75%,rgba(6,182,212,0.1))] bg-[length:60px_60px] animate-[slide_2s_linear_infinite]" />
      </div>
    );
  }

  if (!slides.length) return null;

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent((p) => (p + 1) % slides.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-[200px] sm:h-[320px] lg:h-[460px] rounded-3xl overflow-hidden group"
    >
      {/* Premium border glow */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 p-[2px] opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none z-20" />

      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title || "banner"}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Multiple gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20 pointer-events-none z-10" />

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={prev}
            aria-label="السابق"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all opacity-0 group-hover:opacity-100 shadow-2xl shadow-black/40"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 rotate-180" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={next}
            aria-label="التالي"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all opacity-0 group-hover:opacity-100 shadow-2xl shadow-black/40"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>

          {/* Dots indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 px-5 py-3 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50"
          >
            {slides.map((_, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`slide ${i + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50"
                    : "w-3 h-3 bg-white/30 hover:bg-white/60 hover:shadow-lg hover:shadow-white/20"
                }`}
              />
            ))}
          </motion.div>

          {/* Counter badge */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-5 sm:top-6 right-5 sm:right-6 z-20 px-4 py-2 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50"
          >
            <span className="text-xs sm:text-sm font-bold text-white">
              <span className="text-cyan-400">{current + 1}</span>
              <span className="text-white/40 mx-1">/</span>
              <span>{slides.length}</span>
            </span>
          </motion.div>

          {/* Play indicator for first load */}
          {current === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20"
              >
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default HeroBanner;