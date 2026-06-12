import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, UserPlus } from "lucide-react";

export default function PromoCTA() {
  const token = localStorage.getItem("token");
  if (token) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 dark:from-cyan-950/50 dark:via-card dark:to-purple-950/30 sm:p-12"
    >
      <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -start-10 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20">
          <Sparkles className="h-7 w-7 text-foreground" />
        </div>
        <div className="max-w-lg space-y-2">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">
            انضم الآن واحصل على أفضل الأسعار
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            سجّل حساباً مجاناً، ارتقِ بمستواك، واستمتع بخصومات حصرية على آلاف
            المنتجات الرقمية.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-foreground shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105"
          >
            <UserPlus className="h-4 w-4" />
            إنشاء حساب
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-cyan-500/40"
          >
            تسجيل الدخول
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
