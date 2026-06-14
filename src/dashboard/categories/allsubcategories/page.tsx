import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  ArrowLeft,
  Box,
  Cloud,
  Eye,
  EyeOff,
  FolderTree,
  LayoutGrid,
  Layers,
  List,
  Package,
  RefreshCw,
  Search,
  Tags,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import getAllSub from "../../../api/getAllSub";
import getCategories from "../../../api/getCategories";
import getSubCategoryStats from "../../../api/getSubCategoryStats";
import Spinner from "../../../components/Spinner";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { cn } from "../../../lib/utils";
import type { Category } from "../../../types/types";
import { AddSubForm } from "./add-sub-form";
import SubCategoryCard from "./sub-category-card";
import SubCategoryRowActions from "./sub-category-row-actions";
import { DataTable } from "./data-table";
import type { DashboardSubCategory, SubFilterKey } from "./sub-utils";
import {
  categoryAccent,
  categoryInitials,
  subTypeLabel,
} from "./sub-utils";

const SEARCH_DEBOUNCE_MS = 400;

function buildSubCategoryColumns(
  t: (k: string) => string,
  query: UseQueryResult
): ColumnDef<DashboardSubCategory>[] {
  return [
    {
      id: "sub",
      accessorFn: (row) => row.name,
      header: t("sub_categories"),
      cell: ({ row }) => {
        const s = row.original;
        const accent = categoryAccent(s.id);
        const isActive = s.active !== false;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
              {s.image ? (
                <img src={s.image} alt={s.name} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-xs font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                  }}
                >
                  {categoryInitials(s.name)}
                </div>
              )}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">{s.name}</p>
              <p className="font-mono text-xs text-muted-foreground">#{s.id}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "parent",
      accessorFn: (row) => row.parent_name,
      header: t("parent_category"),
      cell: ({ row }) => {
        const name = row.original.parent_name;
        const parentId = row.original.parent_id;
        if (!name) return "—";
        return parentId ? (
          <Link
            to={`../${parentId}/sub`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Tags className="h-3.5 w-3.5" />
            {name}
          </Link>
        ) : (
          <span className="text-sm">{name}</span>
        );
      },
    },
    {
      accessorKey: "type",
      header: t("type"),
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {subTypeLabel(row.original.type, t)}
        </Badge>
      ),
    },
    {
      accessorKey: "bonus",
      header: t("bonus"),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original.bonus ?? 0}%</span>
      ),
    },
    {
      accessorKey: "order",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ms-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("cat_sort_order")}
          <ArrowUpDown className="ms-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums">{row.original.order}</span>
      ),
    },
    {
      id: "product_count",
      accessorFn: (row) => row.product_count ?? 0,
      header: t("products"),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-sm tabular-nums">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          {row.original.product_count ?? 0}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => row.active,
      header: t("status"),
      cell: ({ row }) => {
        const isActive = row.original.active !== false;
        return (
          <Badge
            variant="outline"
            className={
              isActive
                ? "border-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "border-0 bg-amber-500/15 text-amber-600 dark:text-amber-400"
            }
          >
            {isActive ? (
              <>
                <Eye className="me-1 h-3 w-3" />
                {t("cat_visible")}
              </>
            ) : (
              <>
                <EyeOff className="me-1 h-3 w-3" />
                {t("cat_hidden")}
              </>
            )}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link to={`${row.original.id}/products`}>{t("products")}</Link>
          </Button>
          <SubCategoryRowActions sub={row.original} query={query} />
        </div>
      ),
    },
  ];
}

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  delay?: number;
};

function StatCard({ label, value, sub, icon, gradient, glow, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md sm:p-5"
    >
      <div
        className={cn(
          "pointer-events-none absolute -end-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-50 group-hover:opacity-80",
          glow
        )}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-foreground sm:text-3xl">
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition-all",
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border/50 bg-card/60 text-muted-foreground hover:border-border hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function DashboardAllSub() {
  const [t, i18n] = useTranslation("global");
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const params = new URLSearchParams(search);
  const searchQuery = params.get("search") || "";
  const filter = (params.get("filter") as SubFilterKey) || "all";
  const parentFilter = params.get("parent") || "all";

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(search);
      if (searchInput.trim()) next.set("search", searchInput.trim());
      else next.delete("search");
      const nextStr = next.toString();
      if (nextStr !== search.replace(/^\?/, "")) {
        navigate({ pathname, search: nextStr }, { replace: true });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput, navigate, pathname, search]);

  const setFilter = useCallback(
    (value: SubFilterKey) => {
      const next = new URLSearchParams(search);
      if (value === "all") next.delete("filter");
      else next.set("filter", value);
      navigate({ pathname, search: next.toString() }, { replace: true });
    },
    [navigate, pathname, search]
  );

  const setParentFilter = useCallback(
    (value: string) => {
      const next = new URLSearchParams(search);
      if (value === "all") next.delete("parent");
      else next.set("parent", value);
      navigate({ pathname, search: next.toString() }, { replace: true });
    },
    [navigate, pathname, search]
  );

  const token = localStorage.getItem("token") as string;

  const statsQuery = useQuery({
    queryKey: ["sub-category-stats"],
    queryFn: async () => {
      const res = await getSubCategoryStats(token);
      return res.data.result;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const parentCategoriesQuery = useQuery({
    queryKey: ["categories", "parents"],
    queryFn: async () => {
      const res = await getCategories({ token });
      return res.data.result as Category[];
    },
    staleTime: 120_000,
    refetchOnWindowFocus: false,
  });

  const subsQuery = useQuery({
    queryKey: ["sub", "dashboard", searchQuery, filter, parentFilter],
    queryFn: async () => {
      const response = await getAllSub({
        token,
        search: searchQuery,
        filter,
        parentId: parentFilter !== "all" ? parentFilter : undefined,
      });
      return response.data.result as DashboardSubCategory[];
    },
    refetchOnWindowFocus: false,
  });

  const refetchAll = () => {
    statsQuery.refetch();
    subsQuery.refetch();
  };

  const columns = useMemo(
    () => buildSubCategoryColumns(t, subsQuery),
    [t, subsQuery]
  );

  const subs = subsQuery.data ?? [];
  const stats = statsQuery.data;
  const parents = parentCategoriesQuery.data ?? [];
  const activeFilters =
    (searchQuery ? 1 : 0) + (filter !== "all" ? 1 : 0) + (parentFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSearchInput("");
    navigate({ pathname, search: "" }, { replace: true });
  };

  if (subsQuery.isLoading && !subsQuery.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 md:px-6 md:py-8">
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-violet-600/15 via-card to-cyan-600/10 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg">
              <Layers className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                {t("sub_categories")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("sub_categories_page_subtitle")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="..">
                <ArrowLeft className="h-4 w-4" />
                {t("categories")}
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={refetchAll}
              disabled={subsQuery.isFetching}
            >
              <RefreshCw
                className={cn("h-4 w-4", subsQuery.isFetching && "animate-spin")}
              />
              {t("refresh")}
            </Button>
            <AddSubForm query={subsQuery} />
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("sub_cat_total")}
          value={stats?.total ?? subs.length}
          sub={t("sub_cat_total_sub")}
          icon={<Layers className="h-5 w-5" />}
          gradient="from-violet-500 to-purple-600"
          glow="bg-violet-500/30"
          delay={0.05}
        />
        <StatCard
          label={t("cat_active")}
          value={stats?.active ?? "—"}
          sub={`${stats?.inactive ?? 0} ${t("cat_hidden").toLowerCase()}`}
          icon={<Eye className="h-5 w-5" />}
          gradient="from-emerald-500 to-teal-600"
          glow="bg-emerald-500/30"
          delay={0.1}
        />
        <StatCard
          label={t("sub_cat_types")}
          value={`${stats?.one ?? 0} / ${stats?.bundle ?? 0}`}
          sub={`${t("one")} / ${t("bundle")}`}
          icon={<Box className="h-5 w-5" />}
          gradient="from-cyan-500 to-blue-600"
          glow="bg-cyan-500/30"
          delay={0.15}
        />
        <StatCard
          label={t("cat_products")}
          value={stats?.products ?? "—"}
          sub={`${stats?.external ?? 0} ${t("cat_external_sync")}`}
          icon={<Package className="h-5 w-5" />}
          gradient="from-amber-500 to-orange-600"
          glow="bg-amber-500/30"
          delay={0.2}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("search_sub_categories")}
              className="ps-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={parentFilter} onValueChange={setParentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("parent_category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_categories")}</SelectItem>
                {parents.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex rounded-xl border border-border/50 bg-background/50 p-1">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="h-4 w-4" />
                {t("view_cards")}
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
                {t("view_table")}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            {t("all")}
          </FilterPill>
          <FilterPill active={filter === "active"} onClick={() => setFilter("active")}>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {t("cat_visible")}
            </span>
          </FilterPill>
          <FilterPill active={filter === "inactive"} onClick={() => setFilter("inactive")}>
            <span className="inline-flex items-center gap-1">
              <EyeOff className="h-3 w-3" />
              {t("cat_hidden")}
            </span>
          </FilterPill>
          <FilterPill active={filter === "one"} onClick={() => setFilter("one")}>
            {t("one")}
          </FilterPill>
          <FilterPill active={filter === "bundle"} onClick={() => setFilter("bundle")}>
            {t("bundle")}
          </FilterPill>
          <FilterPill active={filter === "external"} onClick={() => setFilter("external")}>
            <span className="inline-flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              {t("cat_external")}
            </span>
          </FilterPill>

          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5" />
              {t("clear_filters")}
            </Button>
          )}

          <span className="ms-auto text-xs text-muted-foreground">
            {subs.length} {t("results")}
          </span>
        </div>
      </section>

      {subsQuery.isFetching && !subsQuery.isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : null}

      {viewMode === "cards" ? (
        subs.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {subs.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <SubCategoryCard sub={sub} query={subsQuery} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
            <FolderTree className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-bold text-foreground">{t("no_results")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("sub_cat_empty_hint")}</p>
          </div>
        )
      ) : (
        <DataTable columns={columns} data={subs} />
      )}
    </div>
  );
}
