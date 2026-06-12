import { motion } from "framer-motion";
import { RefreshCw, Lock, Star, DollarSign, Headphones, ShieldCheck, Zap } from "lucide-react";

const ITEMS = [
  {
    icon: RefreshCw,
    label: "تحديث مستمر",
    sub: "منتجات جديدة يومياً",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Lock,
    label: "أمان وخصوصية",
    sub: "بياناتك محمية بالكامل",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Star,
    label: "آلاف العملاء",
    sub: "ثقة وتقييمات عالية",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: DollarSign,
    label: "أسعار تنافسية",
    sub: "خصومات حسب مستواك",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Zap,
    label: "تسليم فوري",
    sub: "استلم خلال ثوانٍ",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Headphones,
    label: "دعم متواصل",
    sub: "فريق جاهز لمساعدتك",
    gradient: "from-sky-500 to-indigo-600",
  },
];

export default function TrustBar() {
  return (
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6 flex items-center justify-center gap-2"
      >
        <ShieldCheck className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-black text-white">لماذا AdamZone؟</h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[#1a2a44]/60 bg-[#0a1628]/60 p-4 text-center backdrop-blur-sm transition-colors hover:border-cyan-500/30"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg`}
            >
              <item.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{item.label}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
