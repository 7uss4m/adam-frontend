import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Filter,
  FolderTree,
  LayoutGrid,
  List,
  Package,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import getProductsPaginated from "../../api/getProductsPaginated";
import getProductStats from "../../api/getProductStats";
import getAllSub from "../../api/getAllSub";
import { Category, Product } from "../../types/types";
import AddProductForm from "./add-product-form";
import ProductCard from "./product-card";
import EditProductForm from "./edit-product-form";
import DeleteProductForm from "./delete-product-form";
import OfferProductForm from "./offer-product-form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../../lib/utils";

const TABLE_PAGE_SIZE = 10;
const CARD_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;

type StatusFilter = "all" | "active" | "inactive";
type OfferFilter = "all" | "offer" | "no_offer";

type StatCardProps = {
  label: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  accent: string;
};

function StatCard({
  label,
  value,
  total,
  icon,
  gradient,
  glow,
  accent,
}: StatCardProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-border/70 hover:shadow-lg">
      <div
        className={cn(
          "pointer-events-none absolute -end-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60",
          glow
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-black tabular-nums tracking-tight text-foreground">
            {value.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/80">
              <div
                className={cn("h-full rounded-full transition-all duration-500", accent)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
              {pct}%
            </span>
          </div>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md",
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

function ProductsSkeleton({ view }: { view: "cards" | "table" }) {
  if (view === "table") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/80">
        <div className="space-y-0 divide-y divide-border/30">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-muted/70" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 animate-pulse rounded-full bg-muted/70" />
                <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted/50" />
              </div>
              <div className="h-8 w-20 animate-pulse rounded-full bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border/40 bg-card/80"
        >
          <div className="h-44 animate-pulse bg-muted/60" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted/70" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted/50" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-muted/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PaginationBar({
  page,
  totalPages,
  total,
  shown,
  onPageChange,
  t,
}: {
  page: number;
  totalPages: number;
  total: number;
  shown: number;
  onPageChange: (page: number) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/80 px-5 py-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {t("showing") || "عرض"}{" "}
        <span className="font-bold text-foreground">{shown}</span> {t("of") || "من"}{" "}
        <span className="font-bold text-foreground">{total.toLocaleString()}</span>{" "}
        {t("products")}
        {totalPages > 1 && (
          <>
            {" · "}
            {t("page") || "صفحة"}{" "}
            <span className="font-bold text-primary">{page}</span>/{totalPages}
          </>
        )}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 rounded-xl border-border/60 px-3 text-xs"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
            {t("previous")}
          </Button>
          <div className="hidden items-center gap-1 sm:flex">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all",
                    pageNum === page
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 rounded-xl border-border/60 px-3 text-xs"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {t("next")}
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DashboardProducts() {
  const [t, i18n] = useTranslation("global");
  const isRtl = i18n.language !== "en";
  const [view, setView] = useState<"cards" | "table">("table");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [offerFilter, setOfferFilter] = useState<OfferFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [offerProduct, setOfferProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const token = localStorage.getItem("token") as string;
  const pageSize = view === "cards" ? CARD_PAGE_SIZE : TABLE_PAGE_SIZE;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, offerFilter, categoryFilter, sourceFilter, view]);

  const categoriesQuery = useQuery({
    queryKey: ["subs-filter"],
    queryFn: async () => {
      const response = await getAllSub();
      return response.data.result as Category[];
    },
    staleTime: 5 * 60_000,
  });

  const statsQuery = useQuery({
    queryKey: ["products-stats"],
    queryFn: async () => {
      const response = await getProductStats(token);
      return response.data.result;
    },
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const productsQuery = useQuery({
    queryKey: [
      "products-admin",
      page,
      pageSize,
      debouncedSearch,
      statusFilter,
      offerFilter,
      categoryFilter,
      sourceFilter,
    ],
    queryFn: async () => {
      const response = await getProductsPaginated(token, {
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter,
        offer: offerFilter,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        source: sourceFilter !== "all" ? sourceFilter : undefined,
        sort: "order_asc",
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  const refetchAll = useCallback(async () => {
    await Promise.all([productsQuery.refetch(), statsQuery.refetch()]);
  }, [productsQuery, statsQuery]);

  const listQuery = useMemo(
    () => ({ ...productsQuery, refetch: refetchAll }),
    [productsQuery, refetchAll]
  );

  const products = productsQuery.data?.result ?? [];
  const pagination = productsQuery.data?.pagination;
  const stats = statsQuery.data;
  const sources = stats?.sources ?? [];

  const activeFilterCount = [
    debouncedSearch,
    statusFilter !== "all",
    offerFilter !== "all",
    categoryFilter !== "all",
    sourceFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setOfferFilter("all");
    setCategoryFilter("all");
    setSourceFilter("all");
    setPage(1);
  };

  const isInitialLoading =
    (productsQuery.isLoading && !productsQuery.data) ||
    (statsQuery.isLoading && !statsQuery.data);

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="container mx-auto space-y-7 px-4 py-8"
    >
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -start-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -end-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-cyan-600 shadow-lg shadow-primary/25">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary/80">
                  Admin
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {t("products")}
              </h1>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {t("products_subtitle") || "إدارة المنتجات والعروض والأسعار"}
              </p>
              {stats && (
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {stats.total.toLocaleString()} {t("total_products") || "منتج"} ·{" "}
                  {stats.withOffers.toLocaleString()} {t("active_offers") || "عرض نشط"}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-border/50 bg-background/60 p-1 shadow-inner backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setView("cards")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
                  view === "cards"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("cards_view") || "عرض كروت"}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                {t("cards_view") || "كروت"}
              </button>
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
                  view === "table"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("table_view") || "عرض جدول"}
              >
                <List className="h-3.5 w-3.5" />
                {t("table_view") || "جدول"}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-xl border-border/60"
              onClick={refetchAll}
              disabled={productsQuery.isFetching}
            >
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5",
                  productsQuery.isFetching && "animate-spin"
                )}
              />
              {t("retry") || "تحديث"}
            </Button>

            <AddProductForm query={listQuery} />
          </div>
        </div>
      </div>

      {/* Stats */}
      {statsQuery.isSuccess && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("total_products") || "إجمالي المنتجات"}
            value={stats.total}
            total={stats.total}
            icon={<Package className="h-5 w-5 text-white" />}
            gradient="from-primary to-cyan-600"
            glow="bg-primary/20"
            accent="bg-primary"
          />
          <StatCard
            label={t("active_products") || "منتجات فعالة"}
            value={stats.active}
            total={stats.total}
            icon={<ToggleRight className="h-5 w-5 text-white" />}
            gradient="from-emerald-500 to-teal-600"
            glow="bg-emerald-500/20"
            accent="bg-emerald-500"
          />
          <StatCard
            label={t("inactive_products") || "منتجات معطلة"}
            value={stats.inactive}
            total={stats.total}
            icon={<ToggleLeft className="h-5 w-5 text-white" />}
            gradient="from-rose-500 to-orange-500"
            glow="bg-rose-500/20"
            accent="bg-rose-500"
          />
          <StatCard
            label={t("active_offers") || "عروض نشطة"}
            value={stats.withOffers}
            total={stats.total}
            icon={<Tag className="h-5 w-5 text-white" />}
            gradient="from-cyan-500 to-blue-600"
            glow="bg-cyan-500/20"
            accent="bg-cyan-500"
          />
        </div>
      )}

      {/* Filters */}
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/80 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-border/30 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {t("filters") || "الفلاتر"}
              </p>
              {activeFilterCount > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {activeFilterCount} {t("active_filters") || "فلتر نشط"}
                </p>
              )}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 rounded-xl text-xs text-destructive hover:text-destructive"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5" />
              {t("clear_filters") || "مسح الفلاتر"}
            </Button>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div className="relative">
            <Search
              className={cn(
                "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                isRtl ? "right-3.5" : "left-3.5"
              )}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                t("search_products") ||
                "ابحث بالاسم، المعرف، الفئة، المصدر..."
              }
              className={cn(
                "h-11 rounded-xl border-border/50 bg-background/60 text-sm shadow-inner backdrop-blur-sm focus-visible:ring-primary/30",
                isRtl ? "pr-10" : "pl-10"
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <FolderTree className="h-3 w-3" />
                {t("category") || "الفئة"}
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-10 rounded-xl border-border/50 bg-background/60 text-xs">
                  <SelectValue placeholder={t("all_categories") || "كل الفئات"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {(categoriesQuery.data ?? []).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <Database className="h-3 w-3" />
                {t("source") || "المصدر"}
              </label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="h-10 rounded-xl border-border/50 bg-background/60 text-xs">
                  <SelectValue placeholder={t("all_sources") || "كل المصادر"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {sources.map((src) => (
                    <SelectItem key={src} value={src}>
                      {src}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {t("status") || "الحالة"}
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "all" as const, label: t("all"), icon: Package },
                  { id: "active" as const, label: t("active"), icon: ToggleRight },
                  {
                    id: "inactive" as const,
                    label: t("inactive") || "معطل",
                    icon: ToggleLeft,
                  },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <FilterPill
                  key={id}
                  active={statusFilter === id}
                  onClick={() => setStatusFilter(id)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </FilterPill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {t("offers") || "العروض"}
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "all" as const, label: t("all") },
                  { id: "offer" as const, label: t("with_offers") || "بعروض" },
                  {
                    id: "no_offer" as const,
                    label: t("without_offers") || "بدون عروض",
                  },
                ] as const
              ).map(({ id, label }) => (
                <FilterPill
                  key={id}
                  active={offerFilter === id}
                  onClick={() => setOfferFilter(id)}
                >
                  {id === "offer" && <Tag className="h-3.5 w-3.5" />}
                  {label}
                </FilterPill>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isInitialLoading ? (
        <ProductsSkeleton view={view} />
      ) : productsQuery.isSuccess ? (
        <>
          {products.length === 0 ? (
            <div className="flex min-h-[38vh] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/50 bg-gradient-to-b from-card/80 to-muted/20 px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/60">
                <Package className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">
                  {t("no_products_found") || "لا توجد منتجات مطابقة"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("try_different_filters") || "جرّب تغيير معايير البحث أو الفلاتر"}
                </p>
              </div>
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={clearFilters}
                >
                  {t("clear_filters") || "مسح الفلاتر"}
                </Button>
              )}
            </div>
          ) : view === "cards" ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    query={listQuery}
                    onOffer={setOfferProduct}
                    onEdit={setEditProduct}
                    onDelete={setDeleteProduct}
                  />
                ))}
              </div>

              {pagination && (
                <PaginationBar
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  shown={products.length}
                  onPageChange={setPage}
                  t={t}
                />
              )}
            </div>
          ) : (
            <DataTable
              query={listQuery}
              columns={columns}
              data={products}
              serverPagination={
                pagination
                  ? {
                      page: pagination.page,
                      pageCount: pagination.totalPages,
                      total: pagination.total,
                      onPageChange: setPage,
                    }
                  : undefined
              }
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-3xl border border-border/40 bg-card/80">
          <Package className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">{t("something_went_wrong")}</p>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={refetchAll}>
            {t("retry") || "إعادة المحاولة"}
          </Button>
        </div>
      )}

      {offerProduct && (
        <OfferProductForm
          product={offerProduct}
          query={listQuery}
          open
          onOpenChange={(open) => {
            if (!open) setOfferProduct(null);
          }}
          hideTrigger
        />
      )}

      {editProduct && (
        <EditProductForm
          id={editProduct.id.toString()}
          query={listQuery}
          product={editProduct}
          open
          onOpenChange={(open) => {
            if (!open) setEditProduct(null);
          }}
          hideTrigger
        />
      )}

      {deleteProduct && (
        <DeleteProductForm
          id={deleteProduct.id.toString()}
          query={listQuery}
          open
          onOpenChange={(open) => {
            if (!open) setDeleteProduct(null);
          }}
          hideTrigger
        />
      )}
    </section>
  );
}
