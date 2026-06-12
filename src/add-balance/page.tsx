import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Headphones,
  BadgePercent,
  CreditCard,
  ChevronLeft,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Home,
} from "lucide-react";

import getBoxes from "../api/getBoxes";
import type { ChargeBox } from "../types/types";
import Spinner from "../components/Spinner";
import { useTranslation } from "react-i18next";

/* ── Feature badges data ── */
const FEATURES = [
  {
    icon: Shield,
    title: "آمن وموثوق",
    sub: "جميع طرق الدفع آمنة",
    color: "cyan",
  },
  {
    icon: Zap,
    title: "تجهيز فوري",
    sub: "يتم معالجة طلبك بسرعة",
    color: "green",
  },
  {
    icon: Headphones,
    title: "دعم 24/7",
    sub: "فريق الدعم متاح دائماً",
    color: "blue",
  },
  {
    icon: BadgePercent,
    title: "أسعار منافسة",
    sub: "أفضل الأسعار والرسوم",
    color: "purple",
  },
] as const;

const COLOR_MAP = {
  cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   text: "text-cyan-400",   glow: "shadow-cyan-500/20" },
  green:  { bg: "bg-green-500/10",  border: "border-green-500/20",  text: "text-green-400",  glow: "shadow-green-500/20" },
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   glow: "shadow-blue-500/20" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/20" },
};

export default function AddBalance() {
  const [t] = useTranslation("global");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getChargeBoxesQuery = useQuery({
    queryKey: ["boxes"],
    queryFn: async () => {
      const response = await getBoxes(localStorage.getItem("token") as string);
      return response.data.result as ChargeBox[];
    },
    refetchOnWindowFocus: false,
  });

  if (getChargeBoxesQuery.isLoading) {
    return (
      <section className="min-h-[60vh] flex justify-center items-center bg-background">
        <Spinner />
      </section>
    );
  }

  if (!getChargeBoxesQuery.isSuccess) {
    return (
      <section className="min-h-svh flex justify-center items-center text-cyan-400 text-xl bg-background">
        {t("something_went_wrong")}
      </section>
    );
  }

  const boxes = getChargeBoxesQuery.data;

  return (
    <div dir="rtl" className="min-h-svh bg-background relative overflow-hidden">

      {/* ── Ambient background effects ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Top glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        {/* Purple accent glow */}
        <div className="absolute top-64 -left-32 h-[300px] w-[300px] rounded-full bg-purple-500/[0.05] blur-[100px]" />
      </div>

      <main className="relative container mx-auto max-w-[95%] md:max-w-[88%] lg:max-w-[80%] xl:max-w-[75%] px-4">

        {/* ── Breadcrumb ── */}
        <nav className="pt-6 pb-2 flex items-center gap-1.5 text-xs text-gray-600">
          <Link to="/" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
            <Home className="w-3 h-3" />
            الرئيسية
          </Link>
          <ChevronLeft className="w-3 h-3" />
          <Link to="/wallet" className="hover:text-cyan-400 transition-colors">المحفظة</Link>
          <ChevronLeft className="w-3 h-3" />
          <span className="text-gray-400">شحن الرصيد</span>
        </nav>

        {/* ══════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════ */}
        <section className="py-10 lg:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-2">

            {/* Right – Text */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center lg:text-right order-2 lg:order-1"
            >
              {/* Icon badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 mb-5 backdrop-blur">
                <CreditCard className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400">بوابة الشحن الآمنة</span>
              </div>

              <h1 className="text-4xl font-black text-foreground leading-tight lg:text-5xl">
                شحن{" "}
                <span className="bg-gradient-to-l from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  الرصيد
                </span>
              </h1>

              <p className="mt-4 text-base text-gray-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                اختر طريقة الدفع المناسبة لإضافة الرصيد بسرعة وأمان.
                جميع المعاملات مشفرة ومحمية.
              </p>

              {/* Stats */}
              <div className="mt-6 flex items-center justify-center gap-6 lg:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-black text-cyan-400">{boxes.length}+</p>
                  <p className="text-[11px] text-gray-500">طريقة دفع</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-black text-green-400">24/7</p>
                  <p className="text-[11px] text-gray-500">دعم فني</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-black text-purple-400">SSL</p>
                  <p className="text-[11px] text-gray-500">تشفير آمن</p>
                </div>
              </div>
            </motion.div>

            {/* Left – Wallet Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 100 }}
              className="relative flex justify-center order-1 lg:order-2"
            >
              {/* Glow rings behind wallet */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-cyan-500/10 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-purple-500/10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-500/[0.06] blur-3xl" />

              {/* Wallet visual – large icon composition */}
              <div className="relative w-56 h-56 lg:w-72 lg:h-72">
                {/* Main wallet icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 border border-cyan-500/20 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-cyan-500/10">
                      <CreditCard className="w-14 h-14 lg:w-18 lg:h-18 text-cyan-400" />
                    </div>
                    {/* Floating coins */}
                    <motion.div
                      animate={{ y: [-4, 4, -4] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-foreground font-black text-sm shadow-lg shadow-yellow-500/30"
                    >
                      $
                    </motion.div>
                    <motion.div
                      animate={{ y: [3, -3, 3] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-foreground font-bold text-xs shadow-lg shadow-green-500/30"
                    >
                      ✓
                    </motion.div>
                    <motion.div
                      animate={{ y: [2, -5, 2] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute top-2 -left-6 w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
                    >
                      <Shield className="w-3.5 h-3.5 text-foreground" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURES BAR
        ══════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pb-10"
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, sub, color }, i) => {
              const c = COLOR_MAP[color];
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  className={`group relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${c.glow} hover:scale-[1.02]`}
                >
                  <div className={`mb-2 inline-flex rounded-xl ${c.bg} p-2.5`}>
                    <Icon className={`h-5 w-5 ${c.text}`} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{title}</h3>
                  <p className="mt-0.5 text-[11px] text-gray-500 leading-relaxed">{sub}</p>
                  {/* Corner glow on hover */}
                  <div className={`pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full ${c.bg} opacity-0 blur-2xl transition-opacity group-hover:opacity-100`} />
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════
            PAYMENT METHODS GRID
        ══════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="pb-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-black text-foreground">طرق الدفع المتاحة</h2>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boxes.map((box, i) => {
              const isSelected = selectedId === box.id;
              return (
                <motion.div
                  key={box.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 + i * 0.04 }}
                >
                  <Link
                    to={`${box.id}/box`}
                    onMouseEnter={() => setSelectedId(box.id)}
                    onMouseLeave={() => setSelectedId(null)}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300
                      ${isSelected
                        ? "border-cyan-500/50 bg-card shadow-lg shadow-cyan-500/10 scale-[1.02]"
                        : "border-border bg-card/80 hover:border-cyan-500/30 hover:shadow-md hover:shadow-cyan-500/5"
                      }`}
                  >
                    {/* Selected badge */}
                    {i === 0 && (
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-green-500/15 border border-green-500/25 px-2.5 py-0.5 backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 text-green-400" />
                        <span className="text-[10px] font-bold text-green-400">الأفضل</span>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-28 bg-[#060e1a] flex items-center justify-center overflow-hidden">
                      {box.image ? (
                        <>
                          <img
                            src={box.image}
                            alt={box.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-gray-600">
                          <CreditCard className="h-8 w-8" />
                          <span className="text-[10px]">بدون صورة</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-cyan-300 transition-colors">
                        {box.name}
                      </h3>
                      {box.description && (
                        <p className="mt-1 text-[11px] text-gray-500 line-clamp-1">{box.description}</p>
                      )}

                      {/* Currency tags */}
                      {box.currencies && box.currencies.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {box.currencies.slice(0, 3).map((cur) => (
                            <span
                              key={cur.id}
                              className="rounded-md bg-[#060e1a] border border-border px-2 py-0.5 text-[10px] font-medium text-gray-400"
                            >
                              {cur.name}
                            </span>
                          ))}
                          {box.currencies.length > 3 && (
                            <span className="rounded-md bg-[#060e1a] border border-border px-2 py-0.5 text-[10px] text-gray-500">
                              +{box.currencies.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <div className={`mt-3 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all duration-300
                        ${isSelected
                          ? "border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-400"
                          : "border-border bg-[#060e1a] text-gray-400 group-hover:border-cyan-500/30 group-hover:text-cyan-400"
                        }`}
                      >
                        اختر الدفع
                        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                      </div>
                    </div>

                    {/* Glow on hover */}
                    <div className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500 ${isSelected ? "opacity-100" : "opacity-0"}`}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════
            BOTTOM HELP BAR
        ══════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="py-10 border-t border-border"
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3 text-center sm:text-right">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20">
                <MessageCircle className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">لم تجد طريقة الدفع المناسبة؟</p>
                <p className="text-xs text-gray-500">إذا كنت تواجه مشكلة في الدفع أو تحتاج إلى طريقة أخرى، تواصل مع فريق الدعم وسنساعدك.</p>
              </div>
            </div>
            <Link
              to="/support"
              className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-2.5 text-sm font-bold text-purple-400 transition-all hover:bg-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10 flex-shrink-0"
            >
              <Headphones className="h-4 w-4" />
              تواصل مع الدعم
            </Link>
          </div>
        </motion.section>

      </main>
    </div>
  );
}