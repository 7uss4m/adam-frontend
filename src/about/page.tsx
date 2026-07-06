import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import getInfo from "../api/getInfo";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  Heart,
  Zap,
  ShieldCheck,
  Users,
  Package,
  Headphones,
  ArrowLeft,
} from "lucide-react";
import logo from "../assets/logo.webp";

export default function AboutPage() {
  const [t] = useTranslation("global");

  const getAboutUsQuery = useQuery({
    queryKey: ["aboutus"],
    queryFn: async () => {
      const response = await getInfo(
        localStorage.getItem("token") as string,
        "aboutus"
      );
      return response.data.date as { aboutus: string | null };
    },
    refetchOnWindowFocus: false,
  });

  const stats = [
    { icon: Users, value: "10K+", label: t("customers") || "عميل" },
    { icon: Package, value: "5K+", label: t("products") || "منتج" },
    { icon: ShieldCheck, value: "100%", label: t("secure") || "دفع آمن" },
    { icon: Headphones, value: "24/7", label: t("support") || "دعم" },
  ];

  const features = [
    {
      icon: Sparkles,
      title: t("quality") || "جودة عالية",
      desc: t("best_quality") || "أفضل المنتجات والخدمات الرقمية بأعلى معايير الجودة.",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: Target,
      title: t("mission") || "رؤيتنا",
      desc: t("our_mission") || "أن نكون الوجهة الأولى للمنتجات الرقمية في المنطقة.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Heart,
      title: t("dedication") || "التزامنا",
      desc: t("customer_first") || "رضا العميل أولويتنا القصوى في كل تعامل.",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: Zap,
      title: t("innovation") || "الابتكار",
      desc: t("always_improving") || "نطوّر خدماتنا باستمرار لنقدّم تجربة أفضل.",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 app-grid-overlay opacity-40 dark:opacity-30" />
      <div className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-accent/15 blur-[120px]" />

      <div className="relative container mx-auto max-w-[1100px] px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <div className="relative mx-auto mb-6 inline-block">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
            <img src={logo} alt="AdamZone" className="relative h-20 object-contain" />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">{t("about_us")}</span>
          </div>

          <h1 className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-4xl font-black text-transparent md:text-6xl">
            AdamZone
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            متجرك الرقمي الأول لكل ما تحتاجه — آلاف المنتجات، تسليم فوري، وأسعار
            تنافسية مع دعم مباشر على مدار الساعة.
          </p>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/60 p-5 text-center backdrop-blur"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_20px_-6px_hsl(var(--primary)/0.6)]">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-foreground">{s.value}</p>
              <p className="text-xs font-bold text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* About text */}
        {getAboutUsQuery.isFetching ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <>
            {getAboutUsQuery.data?.aboutus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative mb-14 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card/80 to-card/40 p-8 shadow-xl backdrop-blur-xl md:p-12"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="mb-5 inline-flex items-center gap-2 text-primary">
                  <span className="h-5 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
                  <span className="text-sm font-black">قصتنا</span>
                </div>
                <p className="relative whitespace-pre-line text-justify text-base leading-8 text-foreground/90">
                  {getAboutUsQuery.data.aboutus}
                </p>
              </motion.div>
            )}

            {/* Values */}
            <div className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {features.map((f, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/70 p-6 shadow-lg backdrop-blur transition-all hover:border-primary/40"
                >
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} text-white shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-black text-foreground">{f.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-10 text-center"
            >
              <div className="pointer-events-none absolute -bottom-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
              <h2 className="relative mb-3 text-2xl font-black text-foreground md:text-3xl">
                جاهز لبدء التسوّق؟
              </h2>
              <p className="relative mb-6 text-sm text-muted-foreground">
                اكتشف آلاف المنتجات الرقمية بأسعار تنافسية وتسليم فوري.
              </p>
              <Link
                to="/"
                className="relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-8 py-4 font-black text-white shadow-[0_10px_30px_-8px_hsl(var(--primary)/0.8)] transition-transform hover:scale-105"
              >
                {t("start_shopping") || "ابدأ التسوّق"}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
