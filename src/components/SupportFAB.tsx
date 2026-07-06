import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, X } from "lucide-react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

const CHANNELS = [
  {
    label: "واتساب",
    href: "https://whatsapp.com/channel/0029VaxeYmZHwXbJDYfOWG3S",
    icon: FaWhatsapp,
    color: "from-green-500 to-emerald-600",
    ring: "shadow-[0_8px_24px_-6px_rgba(34,197,94,0.7)]",
  },
  {
    label: "تيليجرام",
    href: "https://t.me/AK15Store",
    icon: FaTelegramPlane,
    color: "from-sky-500 to-blue-600",
    ring: "shadow-[0_8px_24px_-6px_rgba(14,165,233,0.7)]",
  },
];

export default function SupportFAB() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 z-[60] flex flex-col items-end gap-3 md:bottom-6 ltr:right-5 rtl:left-5">
      {/* backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 -z-10 bg-background/40 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* channel buttons */}
      <AnimatePresence>
        {open && (
          <div className="flex flex-col items-end gap-3">
            {CHANNELS.map((c, i) => (
              <motion.a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 22,
                  delay: i * 0.06,
                }}
                className="group flex items-center gap-3"
              >
                <span className="rounded-xl border border-border/60 bg-card/95 px-3 py-1.5 text-xs font-black text-foreground shadow-lg backdrop-blur">
                  {c.label}
                </span>
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} ${c.ring} text-white transition-transform group-hover:scale-110`}
                >
                  <c.icon className="h-6 w-6" />
                </span>
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* main toggle */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.9 }}
        aria-label="الدعم"
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-[0_10px_30px_-6px_hsl(var(--primary)/0.8)]"
      >
        {/* pulse ring */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-2xl bg-primary/40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="relative"
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="support"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <Headphones className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
