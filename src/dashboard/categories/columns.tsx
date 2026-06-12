import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, EyeOff, Layers, Package } from "lucide-react";
import { UseQueryResult } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import type { DashboardCategory } from "./category-utils";
import { categoryAccent, categoryInitials } from "./category-utils";
import CategoryRowActions from "./category-row-actions";

export function createColumns(
  t: (k: string) => string,
  query: UseQueryResult
): ColumnDef<DashboardCategory>[] {
  return [
    {
      id: "category",
      accessorFn: (row) => row.name,
      header: t("categories") || "التصنيف",
      cell: ({ row }) => {
        const c = row.original;
        const accent = categoryAccent(c.id);
        const isActive = c.active !== false;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
              {c.image ? (
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-xs font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                  }}
                >
                  {categoryInitials(c.name)}
                </div>
              )}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">{c.name}</p>
              <p className="font-mono text-xs text-muted-foreground">#{c.id}</p>
            </div>
          </div>
        );
      },
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
          {t("cat_sort_order") || "الترتيب"}
          <ArrowUpDown className="ms-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums">{row.original.order}</span>
      ),
    },
    {
      id: "sub_count",
      accessorFn: (row) => row.sub_count ?? 0,
      header: t("sub_categories"),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-sm tabular-nums">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          {row.original.sub_count ?? 0}
        </span>
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
      header: t("status") || "الحالة",
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
      id: "source",
      accessorFn: (row) => row.source,
      header: t("cat_source") || "المصدر",
      cell: ({ row }) => {
        const src = row.original.source;
        if (!src) return "—";
        return (
          <Badge variant="secondary" className="capitalize">
            {src}
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
            <Link to={`${row.original.id}/sub`}>{t("sub_categories")}</Link>
          </Button>
          <CategoryRowActions category={row.original} query={query} />
        </div>
      ),
    },
  ];
}
