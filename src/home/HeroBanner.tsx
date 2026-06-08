import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getAds from "../api/getAds"; // ✅ adjust path
import type { Ad } from "../types/types"; // ✅ adjust path

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

  // ✅ fetch from backend
  const adsQuery = useQuery({
    queryKey: ["ads", "hero-banner"],
    queryFn: async () => {
      const res = await getAds();
      return res.data.result as Ad[];
    },
    refetchOnWindowFocus: false,
  });

  // ✅ map backend -> slides (keep same visual structure)
  const slides: Slide[] = useMemo(() => {
    const ads = adsQuery.data || [];
    return ads
      .filter((a) => !!a?.image)
      .map((ad) => ({
        id: ad.id,
        image: String(ad.image),
        // you used description as banner text in layout before
        title: String(ad.description || ""),
        subtitle: "", // if you have another field, put it here
        // you used title as external url before
        href: toExternalUrl(String(ad.title || "")),
      }));
  }, [adsQuery.data]);

  // reset when data arrives/changes
  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  // autoplay
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const go = (dir: number) => {
    if (!slides.length) return;
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);
  };

  if (adsQuery.isLoading) {
    // optional skeleton
    return (
      <div className="relative h-[300px] overflow-hidden rounded-2xl bg-secondary/40 sm:h-[400px] lg:h-[480px]" />
    );
  }

  if (!slides.length) return null;

  return (
    <div className="relative h-[300px] overflow-hidden rounded-2xl sm:h-[400px] lg:h-[480px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="h-full w-full object-cover"
          />

          {/* click-through to backend url (if exists) */}
          {slides[current].href && slides[current].href !== "#" ? (
            <a
              href={slides[current].href}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-10"
              aria-label={slides[current].title || "Open banner"}
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-center">
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-orbitron text-2xl font-black text-foreground text-glow sm:text-4xl lg:text-5xl"
            >
              {slides[current].title}
            </motion.h2>

            {slides[current].subtitle ? (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base"
              >
                {slides[current].subtitle}
              </motion.p>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute z-30 right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/60 p-2 backdrop-blur-sm transition hover:bg-primary/20"
            aria-label="Prev"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute z-30 left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/60 p-2 backdrop-blur-sm transition hover:bg-primary/20"
            aria-label="Next"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={slides[i].id}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? "w-8 bg-primary glow-primary"
                  : "w-2 bg-muted-foreground/40"
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
