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
      className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/50 via-[#0a1628] to-purple-950/30 p-8 sm:p-12"
    >
      <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -start-10 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <div className="max-w-lg space-y-2">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            انضم الآن واحصل على أفضل الأسعار
          </h2>
          <p className="text-sm text-gray-400 sm:text-base">
            سجّل حساباً مجاناً، ارتقِ بمستواك، واستمتع بخصومات حصرية على آلاف
            المنتجات الرقمية.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105"
          >
            <UserPlus className="h-4 w-4" />
            إنشاء حساب
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#1a2a44] bg-[#050B14]/60 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-cyan-500/40"
          >
            تسجيل الدخول
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
