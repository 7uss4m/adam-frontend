import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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

  if (adsQuery.isLoading) {
    return (
      <div className="relative h-[220px] overflow-hidden rounded-2xl bg-secondary/40 sm:h-[320px] lg:h-[420px]" />
    );
  }

  if (!slides.length) return null;

  return (
    <div className="relative h-[220px] overflow-hidden rounded-2xl sm:h-[320px] lg:h-[420px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="h-full w-full object-cover"
          />

          {slides[current].href && slides[current].href !== "#" ? (
            <a
              href={slides[current].href}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-10"
              aria-label={slides[current].title || "Open banner"}
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-10">
            {slides[current].title && (
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-md text-lg font-bold text-white sm:text-2xl lg:text-3xl"
              >
                {slides[current].title}
              </motion.h2>
            )}

            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/add-balance"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-105"
              >
                ادفع الآن
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={slides[i].id}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
