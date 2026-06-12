import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

import getBoxes from "../api/getBoxes";
import type { ChargeBox } from "../types/types";
import { cn } from "../lib/utils";
import SectionHeader from "./SectionHeader";

export default function TopUpSection() {
  const { i18n } = useTranslation("global");
  const token = useMemo(() => localStorage.getItem("token") || "", []);

  const [boxesRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
    align: "start",
    direction: i18n.language === "ar" ? "rtl" : "ltr",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const boxesQuery = useQuery({
    queryKey: ["boxes", "home"],
    queryFn: async () => {
      const res = await getBoxes(token);
      return res.data.result as ChargeBox[];
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (!token) return null;

  return (
    <section id="topup" className="py-4">
      <SectionHeader
        icon={Wallet}
        title="شحن رصيدك"
        subtitle="وسائل دفع متعددة — شحن فوري"
        viewAllHref="/add-balance"
        accent="text-emerald-400"
      />

      {boxesQuery.isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 w-56 shrink-0 animate-pulse rounded-2xl bg-[#0a1628] border border-[#1a2a44]"
            />
          ))}
        </div>
      ) : boxesQuery.isError || !boxesQuery.data?.length ? (
        <Link
          to="/add-balance"
          className="flex items-center justify-center rounded-2xl border border-dashed border-[#1a2a44] bg-[#0a1628]/50 py-12 text-sm text-gray-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
        >
          اذهب لصفحة شحن الرصيد ←
        </Link>
      ) : (
        <div className="group/carousel relative">
          <div ref={boxesRef} className="overflow-hidden">
            <div className="flex gap-4">
              {boxesQuery.data.map((box, i) => (
                <div
                  key={box.id}
                  className="shrink-0 basis-[72%] sm:basis-[46%] md:basis-[32%] lg:basis-[24%]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      to={`/add-balance/${box.id}/box`}
                      className={cn(
                        "group block overflow-hidden rounded-2xl border border-[#1a2a44]/80 bg-[#0a1628]/90",
                        "transition-all hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
                      )}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#0d1b2e]">
                        {box.image ? (
                          <img
                            src={box.image}
                            alt={box.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            draggable={false}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Wallet className="h-12 w-12 text-emerald-500/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/80 to-transparent" />
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-1 text-sm font-bold text-white">
                          {box.name}
                        </p>
                        <p className="mt-1 text-[10px] text-emerald-400/80">
                          شحن فوري
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {(boxesQuery.data?.length ?? 0) > 3 && (
            <>
              <button
                type="button"
                title="السابق"
                onClick={scrollPrev}
                className="absolute -end-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#1a2a44] bg-[#0a1628]/95 text-white opacity-0 backdrop-blur-md transition-all group-hover/carousel:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                title="التالي"
                onClick={scrollNext}
                className="absolute -start-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#1a2a44] bg-[#0a1628]/95 text-white opacity-0 backdrop-blur-md transition-all group-hover/carousel:opacity-100"
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
