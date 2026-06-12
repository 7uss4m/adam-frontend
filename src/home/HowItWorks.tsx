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

export default function HowItWorks() {
  return (
    <section className="py-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-500/80">
          كيف يعمل؟
        </p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          ثلاث خطوات للشراء
        </h2>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, step, title, desc, color }, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-[#1a2a44]/60 bg-[#0a1628]/80 p-6 backdrop-blur-sm"
          >
            <span className="absolute -end-2 -top-4 text-7xl font-black text-white/[0.03]">
              {step}
            </span>
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg`}
            >
              <Icon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-black text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
