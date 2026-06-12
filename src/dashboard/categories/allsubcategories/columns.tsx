import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, EyeOff, Package, Tags } from "lucide-react";
import { UseQueryResult } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import type { DashboardSubCategory } from "./sub-utils";
import { categoryAccent, categoryInitials, subTypeLabel } from "./sub-utils";
import SubCategoryRowActions from "./sub-category-row-actions";

export function createColumns(
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
