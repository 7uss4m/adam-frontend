import { motion } from "framer-motion";
import { RefreshCw, Lock, Star, DollarSign } from "lucide-react";

const ITEMS = [
  { icon: RefreshCw, label: "تحديث مستمر", sub: "نضيف منتجات جديدة دائماً", color: "bg-cyan-500" },
  { icon: Lock, label: "خصوصية وأمان", sub: "نحافظ على بياناتك", color: "bg-gray-500" },
  { icon: Star, label: "مراجعات موثوقة", sub: "آلاف العملاء راضون", color: "bg-yellow-500" },
  { icon: DollarSign, label: "أسعار تنافسية", sub: "أفضل الأسعار دائماً", color: "bg-green-500" },
];

export default function TrustBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-4 mb-2 border-t border-[#1a2a44] pt-8"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ITEMS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#1a2a44] bg-[#0a1628]/50"
          >
            <div className={`p-2.5 rounded-full ${item.color} flex-shrink-0`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white">{item.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}