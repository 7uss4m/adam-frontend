import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  List,
  Package,
  Search,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import getProductsPaginated from "../../api/getProductsPaginated";
import getProductStats from "../../api/getProductStats";
import getAllSub from "../../api/getAllSub";
import Spinner from "../../components/Spinner";
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

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            accent
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardProducts() {
  const [t, i18n] = useTranslation("global");
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

  const hasActiveFilters =
    debouncedSearch ||
    statusFilter !== "all" ||
    offerFilter !== "all" ||
    categoryFilter !== "all" ||
    sourceFilter !== "all";

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
      dir={i18n.language === "en" ? "ltr" : "rtl"}
      className="container mx-auto space-y-6 px-4 py-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary to-cyan-600 p-2.5 shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">
              {t("products")}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("products_subtitle") || "إدارة المنتجات والعروض والأسعار"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setView("cards")}
              className={cn(
                "p-2 transition-colors",
                view === "cards"
                  ? "bg-primary text-white"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground"
              )}
              title={t("cards_view") || "عرض كروت"}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={cn(
                "p-2 transition-colors",
                view === "table"
                  ? "bg-primary text-white"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground"
              )}
              title={t("table_view") || "عرض جدول"}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <AddProductForm query={listQuery} />
        </div>
      </div>

      {statsQuery.isSuccess && stats && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label={t("total_products") || "إجمالي المنتجات"}
            value={stats.total}
            icon={<Package className="h-5 w-5 text-primary" />}
            accent="bg-primary/10"
          />
          <StatCard
            label={t("active_products") || "منتجات فعالة"}
            value={stats.active}
            icon={<ToggleRight className="h-5 w-5 text-emerald-600" />}
            accent="bg-emerald-500/10"
          />
          <StatCard
            label={t("inactive_products") || "منتجات معطلة"}
            value={stats.inactive}
            icon={<ToggleLeft className="h-5 w-5 text-red-500" />}
            accent="bg-red-500/10"
          />
          <StatCard
            label={t("active_offers") || "عروض نشطة"}
            value={stats.withOffers}
            icon={<Tag className="h-5 w-5 text-cyan-600" />}
            accent="bg-cyan-500/10"
          />
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              t("search_products") ||
              "ابحث بالاسم، المعرف، الفئة، المصدر..."
            }
            className="h-11 pr-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              {t("category") || "الفئة"}
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 text-xs">
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
            <label className="text-xs font-semibold text-muted-foreground">
              {t("source") || "المصدر"}
            </label>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-9 text-xs">
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("status") || "الحالة"}:
          </span>
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
            <Button
              key={id}
              type="button"
              size="sm"
              variant={statusFilter === id ? "default" : "outline"}
              className="h-8 gap-1.5 text-xs"
              onClick={() => setStatusFilter(id)}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("offers") || "العروض"}:
          </span>
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
            <Button
              key={id}
              type="button"
              size="sm"
              variant={offerFilter === id ? "default" : "outline"}
              className="h-8 text-xs"
              onClick={() => setOfferFilter(id)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {t("showing") || "عرض"} {products.length} {t("of") || "من"}{" "}
            {pagination?.total ?? 0} {t("products")}
            {productsQuery.isFetching && (
              <span className="ms-2 text-primary">...</span>
            )}
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
              {t("clear_filters") || "مسح الفلاتر"}
            </Button>
          )}
        </div>
      </div>

      {isInitialLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : productsQuery.isSuccess ? (
        <>
          {products.length === 0 ? (
            <div className="flex min-h-[35vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/50">
              <Package className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {t("no_products_found") || "لا توجد منتجات مطابقة"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  {t("clear_filters") || "مسح الفلاتر"}
                </Button>
              )}
            </div>
          ) : view === "cards" ? (
            <div className="space-y-4">
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

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    {t("page") || "صفحة"} {pagination.page} {t("of") || "من"}{" "}
                    {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      {t("previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      {t("next")}
                    </Button>
                  </div>
                </div>
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
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <Package className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">{t("something_went_wrong")}</p>
          <Button variant="outline" size="sm" onClick={refetchAll}>
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
