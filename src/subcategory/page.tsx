/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useMemo, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronLeft, ChevronDown, Layers, Package, X,
  Shield, Zap, Headphones, BadgeCheck,
  LayoutGrid, List, Check, Star,
  ShoppingCart, RefreshCw, Lock,
  DollarSign, MessageSquare, Coins, User,
  Percent, Gift,
} from "lucide-react";
import logo from "../assets/logo.webp";

import type { Category, Product } from "../types/types";

import Spinner from "../components/Spinner";
import getSubCategories from "../api/getSubCategories";
import getProducts from "../api/getProducts";
import getCategories from "../api/getCategories";

/* ── Feature badges with subtitles (matching screenshot) ── */
const FEATURES_TOP = [
  { icon: Zap, label: "تسليم فوري", subtitle: "في غضون دقائق", iconBg: "bg-cyan-500", iconColor: "text-foreground" },
  { icon: Shield, label: "دفع آمن", subtitle: "حماية 100%", iconBg: "bg-emerald-500", iconColor: "text-foreground" },
  { icon: Headphones, label: "دعم فني 24/7", subtitle: "نحن هنا لمساعدتك", iconBg: "bg-blue-500", iconColor: "text-foreground" },
  { icon: BadgeCheck, label: "منتجات أصلية", subtitle: "جودة مضمونة 100%", iconBg: "bg-cyan-400", iconColor: "text-foreground" },
];

/* ── Bottom trust bar (matching screenshot) ── */
const TRUST_BOTTOM = [
  { icon: RefreshCw, label: "تحديث مستمر", subtitle: "نضيف منتجات جديدة دائماً", iconBg: "bg-cyan-500" },
  { icon: Lock, label: "خصوصية وأمان", subtitle: "نحافظ على بياناتك", iconBg: "bg-gray-400" },
  { icon: MessageSquare, label: "مراجعات موثوقة", subtitle: "آلاف العملاء راضون", iconBg: "bg-yellow-500" },
  { icon: DollarSign, label: "أسعار تنافسية", subtitle: "أفضل الأسعار دائماً", iconBg: "bg-green-500" },
];

/* ── Sort options ── */
type SortKey = "default" | "best-selling" | "name" | "price-asc" | "price-desc";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "الافتراضي" },
  { value: "best-selling", label: "الأكثر مبيعاً" },
  { value: "name", label: "الاسم" },
  { value: "price-asc", label: "السعر: الأقل" },
  { value: "price-desc", label: "السعر: الأعلى" },
];

/* ── Icons for subcategory tabs ── */
const TAB_ICONS = [Coins, Percent, User, Gift, Package, Layers, Star, Shield];

/* ── Sort Dropdown ── */
function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">ترتيب حسب</span>
        <button
          type="button"
          title="ترتيب"
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 rounded-xl border bg-card text-foreground px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            open ? "border-cyan-500 ring-2 ring-cyan-500/20" : "border-border hover:border-cyan-500/40"
          }`}
        >
          <span>{current?.label}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 z-50 min-w-[180px] rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-3 text-xs font-semibold transition-colors ${
                  value === o.value
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-muted-foreground hover:bg-white/5"
                }`}
              >
                <span>{o.label}</span>
                {value === o.value && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Product Card ── */
function ProductCard({
  product,
  index,
  parentId,
  view,
}: {
  product: Product;
  index: number;
  parentId: string;
  view: "grid" | "list";
}) {
  const [imgSrc, setImgSrc] = useState(product.image || logo);
  const price = product.price ? parseFloat(product.price) : null;
  const originalPrice = product.originalPrice
    ? Number(product.originalPrice)
    : product.mainPrice && price && parseFloat(product.mainPrice) > price
      ? parseFloat(product.mainPrice)
      : null;
  const hasDiscount =
    product.hasOffer || (originalPrice != null && price != null && originalPrice > price);
  const showBadge = product.hasOffer;
  const badgeText = "عرض خاص";
  const badgeColor = "bg-cyan-600";

  // Generate pseudo rating
  const rating = 4.9;
  const reviewCount = 100 + index * 47;

  if (view === "list") {
    return (
      <Link
        to={`/categories/${parentId}/product/${product.id}`}
        onClick={(e) => { if (!product.active) e.preventDefault(); }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03, duration: 0.35 }}
          viewport={{ once: true }}
          whileHover={product.active ? { x: -3 } : {}}
          className={`group flex items-center gap-4 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 ${!product.active ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
            <img
              src={imgSrc}
              alt={product.name}
              className={`h-full w-full ${imgSrc === logo ? "object-contain p-2" : "object-cover"}`}
              loading="lazy"
              onError={() => setImgSrc(logo)}
            />
            {showBadge && (
              <div className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded text-[9px] font-bold text-foreground ${badgeColor}`}>
                {badgeText}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[11px] text-yellow-400 font-bold">{rating}</span>
              <span className="text-[10px] text-muted-foreground">({reviewCount})</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {price != null && (
                <span className="text-sm font-black text-cyan-400">${price.toLocaleString()}</span>
              )}
              {hasDiscount && originalPrice != null && (
                <span className="text-xs text-muted-foreground line-through">${originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>

          {product.active && (
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-foreground hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
                <span>شراء الآن</span>
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </motion.div>
      </Link>
    );
  }

  return (
    <Link
      to={`/categories/${parentId}/product/${product.id}`}
      onClick={(e) => { if (!product.active) e.preventDefault(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.4 }}
        viewport={{ once: true }}
        whileHover={product.active ? { y: -6, scale: 1.02 } : {}}
        className={`group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 ${!product.active ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imgSrc}
            alt={product.name}
            className={`h-full w-full transition-transform duration-500 group-hover:scale-110 ${imgSrc === logo ? "object-contain p-6" : "object-cover"}`}
            loading="lazy"
            onError={() => setImgSrc(logo)}
          />

          {/* Badge */}
          {showBadge && (
            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold text-foreground ${badgeColor}`}>
              {badgeText}
            </div>
          )}

          {!product.active && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-red-500/90 text-[10px] font-bold text-foreground">
              غير متاح
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5 space-y-2">
          {/* Title */}
          <h3 className="text-sm font-bold text-foreground line-clamp-1 text-center">{product.name}</h3>

          {/* Rating */}
          <div className="flex items-center justify-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-[11px] text-yellow-400 font-bold">{rating}</span>
            <span className="text-[10px] text-muted-foreground">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-center gap-2">
            {price != null && (
              <span className="text-base font-black text-cyan-400">${price.toLocaleString()}</span>
            )}
            {hasDiscount && originalPrice != null && (
              <span className="text-xs text-muted-foreground line-through">${originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Buy Button */}
          {product.active && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-foreground shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-shadow"
            >
              <span>شراء الآن</span>
              <ShoppingCart className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════ */
export default function SubCategoryPage() {
  const params = useParams();
  const id = params.id as string;
  const [t] = useTranslation("global");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortKey>("best-selling");
  const [activeTab, setActiveTab] = useState<string>("all");

  /* ── Queries ── */
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getCategories();
      return response.data.result as Category[];
    },
    refetchOnWindowFocus: false,
  });

  const parentCategory = useMemo(() => {
    return categoriesQuery.data?.find((c) => String(c.id) === id);
  }, [categoriesQuery.data, id]);

  const getSubsQuery = useQuery({
    queryKey: ["sub", id],
    queryFn: async () => {
      const response = await getSubCategories(id);
      return response.data.result as Category[];
    },
    refetchOnWindowFocus: false,
  });

  const getProductQuery = useQuery({
    queryKey: ["getProduct", id],
    queryFn: async () => {
      const response = await getProducts(id, localStorage.getItem("token") as string);
      return response.data.result as Product[];
    },
    refetchOnWindowFocus: false,
  });

  /* ── Derived ── */
  const filteredSubs = useMemo(() => {
    const list = getSubsQuery.data || [];
    if (!search.trim()) return list;
    return list.filter((c) => (c.name || "").includes(search));
  }, [getSubsQuery.data, search]);

  const filteredProducts = useMemo(() => {
    let list = getProductQuery.data || [];
    if (search.trim()) {
      list = list.filter((p) => (p.name || "").includes(search));
    }
    if (sort === "name") {
      list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sort === "price-asc") {
      list = [...list].sort((a, b) => parseFloat(a.price || "0") - parseFloat(b.price || "0"));
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => parseFloat(b.price || "0") - parseFloat(a.price || "0"));
    }
    return list;
  }, [getProductQuery.data, search, sort]);

  const loading = getSubsQuery.isLoading || getProductQuery.isLoading;
  const totalSubs = getSubsQuery.data?.length ?? 0;
  const totalProducts = getProductQuery.data?.length ?? 0;

  return (
    <section className="min-h-screen pb-20 bg-background">
      <div className="container max-w-[100%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[75%] px-4 py-6 space-y-6">

        {/* ═══ Breadcrumbs ═══ */}
        <motion.nav
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link to="/" className="hover:text-cyan-400 transition-colors">
            {t("home") || "الرئيسية"}
          </Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <Link to="/categories" className="hover:text-cyan-400 transition-colors">
            {t("categories") || "الأقسام"}
          </Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-cyan-400 font-semibold">
            {parentCategory?.name || "..."}
          </span>
        </motion.nav>

        {/* ═══ Category Header ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-500/30 bg-card shadow-lg shadow-cyan-500/10 flex-shrink-0">
            <img
              src={parentCategory?.image || logo}
              alt={parentCategory?.name || ""}
              className={`w-full h-full ${parentCategory?.image ? "object-cover" : "object-contain p-2"}`}
              onError={(e) => { (e.target as HTMLImageElement).src = logo; }}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              منتجات {parentCategory?.name || ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalProducts > 0 ? `${totalProducts} منتج متاح` : ""}
            </p>
          </div>
        </motion.div>

        {/* ═══ Search Bar (full width, prominent) ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full rounded-2xl border border-border bg-card px-5 py-4 pr-5 pl-14 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          {search && (
            <button
              type="button"
              title="مسح البحث"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </motion.div>

        {/* ═══ Feature Badges Row ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {FEATURES_TOP.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card/80 backdrop-blur-sm"
            >
              <div className={`p-2.5 rounded-xl ${f.iconBg} flex-shrink-0`}>
                <f.icon className={`w-5 h-5 ${f.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">{f.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══ Subcategory Tabs Section ═══ */}
        {totalSubs > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {/* Section header */}
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-foreground" />
              <h2 className="text-base font-black text-foreground">{t("subcategories") || "الفئات الفرعية"}</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {/* "All" tab */}
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  activeTab === "all"
                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10"
                    : "bg-card border-border text-muted-foreground hover:border-cyan-500/30 hover:text-gray-200"
                }`}
              >
                <div className={`p-2 rounded-xl ${activeTab === "all" ? "bg-cyan-500 text-foreground" : "bg-muted text-muted-foreground"}`}>
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">الكل</p>
                  <p className="text-[10px] text-muted-foreground">{totalProducts} منتج</p>
                </div>
              </button>

              {filteredSubs.map((cat, i) => {
                const TabIcon = TAB_ICONS[i % TAB_ICONS.length];
                const isActive = activeTab === String(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setActiveTab(String(cat.id))}
                    className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${
                      isActive
                        ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10"
                        : "bg-card border-border text-muted-foreground hover:border-cyan-500/30 hover:text-gray-200"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? "bg-cyan-500 text-foreground" : "bg-muted text-muted-foreground"}`}>
                      <TabIcon className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{cat.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ═══ View Toggle + Sort Bar ═══ */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-between"
          >
            {/* View toggle */}
            <div className="flex rounded-xl border border-border bg-card overflow-hidden">
              <button
                type="button"
                title="عرض شبكي"
                onClick={() => setView("grid")}
                className={`p-2.5 transition-colors ${view === "grid" ? "bg-cyan-500 text-foreground" : "text-muted-foreground hover:text-muted-foreground hover:bg-white/5"}`}
              >
                <LayoutGrid className="w-4.5 h-4.5" />
              </button>
              <div className="w-px bg-muted" />
              <button
                type="button"
                title="عرض قائمة"
                onClick={() => setView("list")}
                className={`p-2.5 transition-colors ${view === "list" ? "bg-cyan-500 text-foreground" : "text-muted-foreground hover:text-muted-foreground hover:bg-white/5"}`}
              >
                <List className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Sort */}
            <SortDropdown value={sort} onChange={setSort} />
          </motion.div>
        )}

        {/* ═══ Content ═══ */}
        {loading ? (
          <div className="min-h-[50vh] flex justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-8">

              {/* Subcategory Cards (only if "all" tab and no subcategories section needed since we use tabs) */}

              {/* Products */}
              {filteredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-base font-black text-foreground">
                      المنتجات ({totalProducts})
                    </h2>
                  </div>

                  {view === "grid" ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                      {filteredProducts.map((prod, i) => (
                        <ProductCard key={`prod-${prod.id}`} product={prod} index={i} parentId={id} view="grid" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {filteredProducts.map((prod, i) => (
                        <ProductCard key={`prod-${prod.id}`} product={prod} index={i} parentId={id} view="list" />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Subcategories as cards when in "all" tab */}
              {activeTab === "all" && filteredSubs.length > 0 && filteredProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-base font-black text-foreground">
                      {t("subcategories") || "الفئات الفرعية"} ({totalSubs})
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {filteredSubs.map((cat, i) => (
                      <Link
                        key={`sub-${cat.id}`}
                        to={`${cat.id}`}
                        onClick={(e) => { if (!cat.available) e.preventDefault(); }}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.4 }}
                          viewport={{ once: true }}
                          whileHover={cat.available ? { y: -5, scale: 1.02 } : {}}
                          className={`group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 ${!cat.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <div className="relative aspect-square overflow-hidden bg-muted">
                            <img
                              src={cat.image || logo}
                              alt={cat.name}
                              className={`h-full w-full transition-transform duration-500 group-hover:scale-110 ${!cat.image ? "object-contain p-4" : "object-cover"}`}
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).src = logo; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                          </div>
                          <div className="px-3 py-2.5 text-center">
                            <p className="text-xs font-bold text-foreground line-clamp-1">{cat.name}</p>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Empty */}
              {filteredSubs.length === 0 && filteredProducts.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground"
                >
                  <Search className="w-12 h-12 opacity-20" />
                  <p className="text-sm">{t("no_results") || "لا توجد نتائج"}</p>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        )}

        {/* ═══ Bottom Trust Bar ═══ */}
        {!loading && (filteredSubs.length > 0 || filteredProducts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 border-t border-border pt-8"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {TRUST_BOTTOM.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <div className={`p-2.5 rounded-full ${f.iconBg} flex-shrink-0`}>
                    <f.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}