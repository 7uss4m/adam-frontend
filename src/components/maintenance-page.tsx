import { motion } from "framer-motion";
import { Construction, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import logo from "../assets/logo.webp";
import { Button } from "./ui/button";

type MaintenancePageProps = {
  onRetry?: () => void;
  isRetrying?: boolean;
};

export default function MaintenancePage({ onRetry, isRetrying }: MaintenancePageProps) {
  const [t, i18n] = useTranslation("global");

  return (
    <div
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-background px-4 py-10"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -end-32 -top-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -start-32 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
          <img src={logo} alt="AdamZone" className="h-14 w-14 rounded-xl object-contain" />
        </div>

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Construction className="h-7 w-7" />
        </div>

        <h1 className="font-orbitron text-2xl font-black text-foreground sm:text-3xl">
          {t("maintenance_title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("maintenance_message")}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              disabled={isRetrying}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
              {t("refresh")}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
