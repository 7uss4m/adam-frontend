// TopUpSection.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import getBoxes from "../api/getBoxes";
import type { ChargeBox } from "../types/types";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

// Small helper: responsive slide widths (feel free to tweak)
function slideBasis(type: "method" | "box") {
  return type === "method"
    ? "basis-[78%] sm:basis-[46%] lg:basis-[23%]"
    : "basis-[60%] sm:basis-[36%] lg:basis-[22%]";
}

export default function TopUpSection() {
  const { i18n } = useTranslation("global");
  // ✅ Drag-free carousel for boxes (API)
  const [boxesRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
    align: "start",
    direction: i18n.language == "ar" ? "rtl" : "ltr",
  });

  const token = useMemo(() => localStorage.getItem("token") || "", []);

  const boxesQuery = useQuery({
    queryKey: ["boxes"],
    queryFn: async () => {
      const res = await getBoxes(token);
      return res.data.result as ChargeBox[];
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return (
    <section id="topup" className="py-8">
      <h2 className="mb-2 font-orbitron text-xl font-bold text-foreground">
        شحن رصيدك
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        اختر وسيلة الدفع المناسبة لك
      </p>

      {/* ✅ Boxes carousel (drag-free) */}
      {!token ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          يجب تسجيل الدخول لعرض صناديق الشحن.
        </div>
      ) : boxesQuery.isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          جارٍ التحميل...
        </div>
      ) : boxesQuery.isError ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          حدث خطأ أثناء جلب الصناديق.
        </div>
      ) : (boxesQuery.data?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          لا توجد صناديق حالياً.
        </div>
      ) : (
        <div ref={boxesRef} className="overflow-hidden">
          <div className="flex gap-4">
            {boxesQuery.data!.map((box, i) => (
              <div key={box.id} className={cn("shrink-0", slideBasis("box"))}>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  viewport={{ once: true }}
                  className="select-none h-full"
                >
                  <Link
                    to={`/add-balance/${box.id}/box`}
                    className={cn(
                      "block h-full overflow-hidden rounded-2xl border border-border bg-card",
                      "transition-colors hover:border-primary/30"
                    )}
                  >
                    <div className="aspect-[4/3] w-full bg-secondary">
                      {box.image ? (
                        <img
                          src={box.image}
                          alt={box.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          draggable={false}
                        />
                      ) : null}
                    </div>

                    <div className="p-4">
                      <p className="line-clamp-1 text-sm font-bold text-foreground">
                        {box.name}
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
