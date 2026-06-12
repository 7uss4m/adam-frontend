import { motion } from "framer-motion";
import { Search, CreditCard, Zap } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "اختر منتجك",
    desc: "تصفّح آلاف المنتجات الرقمية من أقسام متنوعة واختر ما يناسبك.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: CreditCard,
    step: "02",
    title: "ادفع بسهولة",
    desc: "شحن فوري عبر وسائل دفع متعددة وآمنة بأسعار تنافسية.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Zap,
    step: "03",
    title: "استلم فوراً",
    desc: "تسليم تلقائي سريع — طلبك يصل خلال ثوانٍ بعد الدفع.",
    color: "from-amber-500 to-orange-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function HowItWorks() {
  return (
    <section className="py-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-500/80">
          كيف يعمل؟
        </p>
        <h2 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
          ثلاث خطوات للشراء
        </h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-5"
      >
        {/* Vertical connector line — mobile only */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-8 top-8 start-6 w-0.5 bg-gradient-to-b from-cyan-500/40 via-violet-500/40 to-amber-500/40 md:hidden"
        />

        {STEPS.map(({ icon: Icon, step, title, desc, color }, i) => (
          <motion.div
            key={step}
            variants={itemVariants}
            className="relative flex gap-4 md:block"
          >
            {/* Step badge — mobile timeline */}
            <div className="relative z-10 flex shrink-0 flex-col items-center md:hidden">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg ring-4 ring-[#050B14]`}
              >
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              {i < STEPS.length - 1 && (
                <span className="mt-1 text-[10px] font-bold text-foreground/20">
                  {step}
                </span>
              )}
            </div>

            <div className="relative min-w-0 flex-1 overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm sm:p-6 md:p-6">
              <span
                aria-hidden
                className="pointer-events-none absolute -end-1 -top-3 select-none text-6xl font-black text-foreground/[0.04] sm:text-7xl"
              >
                {step}
              </span>

              {/* Icon — desktop */}
              <div
                className={`mb-4 hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg md:flex`}
              >
                <Icon className="h-7 w-7 text-foreground" />
              </div>

              <h3 className="text-base font-black text-foreground sm:text-lg">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
