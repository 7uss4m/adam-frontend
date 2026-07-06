import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  LayoutGrid,
  Gamepad2,
  MessageCircle,
  Crown,
  Globe,
  DollarSign,
  Send,
  CreditCard,
  Gift,
  Zap,
  Tv,
  HandHeart,
  type LucideIcon,
} from "lucide-react";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";
import SectionHeader from "./SectionHeader";
import { safeOrder } from "./home-utils";

/* map category name → line icon (matches the outline style) */
const ICON_RULES: { icon: LucideIcon; keys: string[] }[] = [
  { icon: Gamepad2, keys: ["لعب", "العاب", "ألعاب", "game", "pubg", "ببجي"] },
  { icon: MessageCircle, keys: ["دردش", "شات", "chat", "محادث"] },
  { icon: Crown, keys: ["اشتراك", "sub", "بريميوم", "premium"] },
  { icon: Globe, keys: ["سوشال", "social", "تواصل", "مواقع"] },
  { icon: DollarSign, keys: ["حوال", "مالي", "مال", "money", "dollar", "بنك", "دفع"] },
  { icon: Send, keys: ["تيلجرام", "تلجرام", "telegram"] },
  { icon: CreditCard, keys: ["بطاق", "card", "فيزا", "visa"] },
  { icon: Gift, keys: ["هدايا", "هدية", "gift"] },
  { icon: Tv, keys: ["مشاهد", "نتفلكس", "netflix", "بث", "tv", "شاهد"] },
  { icon: Zap, keys: ["شحن", "رصيد", "recharge"] },
  { icon: HandHeart, keys: ["اخرى", "أخرى", "متنوع", "other"] },
];

function iconFor(name: string): LucideIcon {
  const n = (name || "").toLowerCase();
  for (const rule of ICON_RULES) {
    if (rule.keys.some((k) => n.includes(k.toLowerCase()))) return rule.icon;
  }
  return Sparkles;
}

function CategoryItem({
  cat,
  index,
  active,
}: {
  cat: Category;
  index: number;
  active: boolean;
}) {
  const Icon = iconFor(cat.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      viewport={{ once: true }}
      className="shrink-0"
    >
      <Link
        to={`/categories/${cat.id}/subs`}
        className="group flex flex-col items-center gap-2"
      >
        <div
          className={
            active
              ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-background shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.7)] transition-all"
              : "flex h-12 w-12 items-center justify-center rounded-2xl text-primary transition-all group-hover:-translate-y-1 group-hover:bg-primary/10"
          }
        >
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <span
          className={
            active
              ? "text-xs font-black text-foreground"
              : "text-xs font-bold text-muted-foreground transition-colors group-hover:text-primary"
          }
        >
          {cat.name}
        </span>
        {/* active underline */}
        <span
          className={
            active
              ? "h-0.5 w-8 rounded-full bg-primary"
              : "h-0.5 w-8 rounded-full bg-transparent"
          }
        />
      </Link>
    </motion.div>
  );
}

export default function CategorySection() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      return (res.data?.result ?? res.data) as Category[];
    },
    refetchOnWindowFocus: false,
  });

  const allCategories = useMemo(() => {
    const list = categoriesQuery.data || [];
    return list
      .filter((c) => c?.available !== false)
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order));
  }, [categoriesQuery.data]);

  const categories = allCategories.slice(0, 8);

  return (
    <section className="py-4">
      <SectionHeader
        icon={Sparkles}
        title="الأقسام"
        subtitle="تصفّح حسب نوع المنتج"
        viewAllHref="/categories"
        accent="text-cyan-400"
      />

      {categoriesQuery.isLoading ? (
        <div className="flex gap-6 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-2">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-muted" />
              <div className="h-2.5 w-10 animate-pulse rounded-full bg-[#1a2a44]" />
            </div>
          ))}
        </div>
      ) : categories.length ? (
        <div className="dashboard-nav-scroll flex items-start gap-6 overflow-x-auto pb-2 sm:justify-between sm:gap-3">
          {categories.map((cat, i) => (
            <CategoryItem key={cat.id} cat={cat} index={i} active={i === 0} />
          ))}

          {/* View all */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: categories.length * 0.05, duration: 0.3 }}
            viewport={{ once: true }}
            className="shrink-0"
          >
            <Link
              to="/categories"
              className="group flex flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/40 text-primary transition-all group-hover:-translate-y-1 group-hover:bg-primary/10">
                <LayoutGrid className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <span className="text-xs font-bold text-muted-foreground transition-colors group-hover:text-primary">
                عرض الكل
              </span>
              <span className="h-0.5 w-8 rounded-full bg-transparent" />
            </Link>
          </motion.div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          لا يوجد أقسام حالياً
        </div>
      )}
    </section>
  );
}
