import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import getAds from "../api/getAds";
import type { Ad } from "../types/types";

function toExternalUrl(raw?: string) {
  if (!raw) return "#";
  const s = raw.trim();
  if (/^(mailto:|tel:)/i.test(s)) return s;
  if (/^(javascript:|data:|vbscript:)/i.test(s)) return "#";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s.replace(/^\/+/, "")}`;
}

type Slide = {
  id: string | number;
  image: string;
  title: string;
  subtitle: string;
  href?: string;
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
      .filter((a) => !!a?.image)
      .map((ad) => ({
        id: ad.id,
        image: String(ad.image),
        title: String(ad.description || ""),
        subtitle: "",
        href: toExternalUrl(String(ad.title || "")),
      }));
  }, [adsQuery.data]);

  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (adsQuery.isLoading) {
    return (
      <div className="relative h-[220px] overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/40 to-secondary/20 sm:h-[320px] lg:h-[420px] border border-primary/20" />
    );
  }

  if (!slides.length) return null;

  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl sm:h-[320px] lg:h-[420px] group">
      {/* Main carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {/* Image */}
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="h-full w-full object-cover"
          />

          {/* Link overlay */}
          {slides[current].href && slides[current].href !== "#" ? (
            <a
              href={slides[current].href}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-10"
              aria-label={slides[current].title || "Open banner"}
            />
          ) : null}

          {/* Multiple gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-8 lg:p-12">
            {slides[current].title && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-2xl"
              >
                <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <span className="text-xs font-bold text-white/80 uppercase tracking-widest">عرض مميز</span>
                </div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                  {slides[current].title}
                </h2>
              </motion.div>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6"
            >
              <Link
                to="/add-balance"
                className="group/btn inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-accent to-primary text-white font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span>ابدأ الآن</span>
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons - Left */}
      <motion.button
        whileHover={{ scale: 1.15, x: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white transition-colors shadow-lg opacity-0 group-hover:opacity-100 duration-300"
        aria-label="Previous slide"
      >
        <ChevronRight className="w-6 h-6 rotate-180" />
      </motion.button>

      {/* Navigation buttons - Right */}
      <motion.button
        whileHover={{ scale: 1.15, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white transition-colors shadow-lg opacity-0 group-hover:opacity-100 duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>

      {/* Enhanced dots indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
          {slides.map((_, i) => (
            <motion.button
              key={slides[i].id}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 h-3 bg-gradient-to-r from-primary to-accent shadow-lg"
                  : "w-3 h-3 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      {slides.length > 1 && (
        <div className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
          <span className="text-sm font-bold text-white">
            {current + 1} / {slides.length}
          </span>
        </div>
      )}

      {/* Border gradient effect */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none border-2 border-transparent bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 bg-clip-border opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default HeroBanner;
