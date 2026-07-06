import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import logo from "../assets/logo.webp";

export default function Spinner() {
  const [t] = useTranslation("global");
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-4">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* rotating ring */}
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        {/* pulsing glow */}
        <motion.span
          className="absolute inset-2 rounded-full bg-primary/20 blur-xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* logo */}
        <motion.img
          src={logo}
          alt="AdamZone"
          className="relative h-12 w-12 object-contain"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.span
        className="text-center text-sm font-semibold text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {t("loading")}
      </motion.span>
    </div>
  );
}
