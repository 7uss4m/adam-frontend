import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, ArrowRight } from "lucide-react";

import getPaymentsMethods from "../api/getPaymentsMethods";
import getBoxes from "../api/getBoxes";
import type { ChargeBox, PaymentMethod } from "../types/types";

import Spinner from "../components/Spinner";
import { useTranslation } from "react-i18next";

export default function AddBalance() {
  // translation
  const [t, i18n] = useTranslation("global");

  // queries (same functionality)
  const getPaymentsMethodsQuery = useQuery({
    queryKey: ["methods"],
    queryFn: async () => {
      const response = await getPaymentsMethods();
      return response.data.result as PaymentMethod[];
    },
    refetchOnWindowFocus: false,
  });

  const getChargeBoxesQuery = useQuery({
    queryKey: ["boxes"],
    queryFn: async () => {
      const response = await getBoxes(localStorage.getItem("token") as string);
      return response.data.result as ChargeBox[];
    },
    refetchOnWindowFocus: false,
  });

  const loading =
    getPaymentsMethodsQuery.isLoading || getChargeBoxesQuery.isLoading;

  if (loading) {
    return (
      <section className="min-h-svh flex justify-center items-center">
        <Spinner />
      </section>
    );
  }

  if (!getPaymentsMethodsQuery.isSuccess || !getChargeBoxesQuery.isSuccess) {
    return (
      <section className="relative text-xl sm:text-4xl text-accent min-h-svh flex justify-center items-center">
        {t("something_went_wrong")}
      </section>
    );
  }

  return (
    <main
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="bg-background"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            {t("back_home") || "العودة للرئيسية"}
          </Link>

          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="font-orbitron text-lg font-bold text-foreground">
              {t("charge") || "شحن الرصيد"}
            </span>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-1">
          {/* Left: Card (same behavior: input disabled + charge button disabled) */}

          {/* Right: Boxes grid (image fills card) */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                {t("choose_box") || "اختر صندوق الشحن"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("tap_box_to_continue") || "اضغط على صندوق للمتابعة"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
              {getChargeBoxesQuery.data.map((box, i) => (
                <motion.div
                  key={box.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`${box.id}/box`}
                    className="group relative block aspect-square w-full h-[120px] overflow-hidden rounded-xl border border-border bg-secondary transition-colors hover:border-primary/30"
                  >
                    {/* full image card */}
                    {box.image ? (
                      <>
                        <img
                          src={box.image}
                          alt={box.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        {t("no_image") || "بدون صورة"}
                      </div>
                    )}

                    {/* bottom title */}
                    <div className="absolute bottom-2 left-0 right-0 px-2 text-center">
                      <p className="text-xs font-bold text-white drop-shadow line-clamp-1">
                        {box.name}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
