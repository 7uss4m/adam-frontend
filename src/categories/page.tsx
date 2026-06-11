import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";
import logo from "../assets/logo.webp";

function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}

const CARD_GRADIENTS = [
  "from-violet-500/20 via-purple-500/10 to-transparent",
  "from-cyan-500/20 via-blue-500/10 to-transparent",
  "from-rose-500/20 via-pink-500/10 to-transparent",
  "from-amber-500/20 via-orange-500/10 to-transparent",
  "from-emerald-500/20 via-teal-500/10 to-transparent",
  "from-sky-500/20 via-indigo-500/10 to-transparent",
  "from-fuchsia-500/20 via-pink-500/10 to-transparent",
  "from-lime-500/20 via-green-500/10 to-transparent",
];

const GLOW_COLORS = [
  "group-hover:shadow-violet-500/30",
  "group-hover:shadow-cyan-500/30",
  "group-hover:shadow-rose-500/30",
  "group-hover:shadow-amber-500/30",
  "group-hover:shadow-emerald-500/30",
  "group-hover:shadow-sky-500/30",
  "group-hover:shadow-fuchsia-500/30",
  "group-hover:shadow-lime-500/30",
];

const BORDER_COLORS = [
  "group-hover:border-violet-500/60",
  "group-hover:border-cyan-500/60",
  "group-hover:border-rose-500/60",
  "group-hover:border-amber-500/60",
  "group-hover:border-emerald-500/60",
  "group-hover:border-sky-500/60",
  "group-hover:border-fuchsia-500/60",
  "group-hover:border-lime-500/60",
];

function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const glow = GLOW_COLORS[index % GLOW_COLORS.length];
  const border = BORDER_COLORS[index % BORDER_COLORS.length];
  const [imgSrc, setImgSrc] = useState(cat.image || logo);

  return (
    <Link to={`/categories/${cat.id}/subs`}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.03, duration: 0.4 }}
        viewport={{ once: true }}
        whileHover={{ y: -6, scale: 1.03 }}
        className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} backdrop-blur-sm transition-all duration-300 shadow-lg ${glow} hover:shadow-xl ${border} cursor-pointer`}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>

        <div className="relative aspect-square overflow-hidden">
          <img
            src={imgSrc}
            alt={cat.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
            loading="lazy"
            onError={() => setImgSrc(logo)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <motion.div
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ArrowLeft className="w-4 h-4 text-white rotate-180" />
          </motion.div>
        </div>

        <div className="px-3 py-3">
          <p className="text-sm font-bold text-white line-clamp-1 text-center tracking-wide drop-shadow">
            {cat.name}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["categories", "all"],
    queryFn: async () => {
      const res = await getCategories();
      return (res.data?.result ?? res.data) as Category[];
    },
    refetchOnWindowFocus: false,
  });

  const categories = useMemo(() => {
    const list = categoriesQuery.data || [];
    return list
      .filter((c) => c?.available !== false)
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order))
      .filter((c) => !search.trim() || c.name.includes(search.trim()));
  }, [categoriesQuery.data, search]);

  return (
    <section className="py-10">
      <div className="container max-w-[100%] md:max-w-[90%] lg:max-w-[80%] px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Link to="/" className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-accent" />
          <h1 className="text-2xl font-black text-foreground">كل الأقسام</h1>
          {categories.length > 0 && (
            <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {categories.length}
            </span>
          )}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8"
        >
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن قسم..."
            className="w-full rounded-xl border border-primary/20 bg-secondary/40 backdrop-blur-sm px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </motion.div>

        {/* Grid */}
        {categoriesQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/5">
                <div className="aspect-square animate-pulse bg-secondary" />
                <div className="px-3 py-3">
                  <div className="h-3 w-2/3 mx-auto rounded animate-pulse bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} cat={cat} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
