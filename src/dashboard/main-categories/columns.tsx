import { ColumnDef } from "@tanstack/react-table";
import { UseQueryResult } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import type { MainCategory } from "../../types/types";
import MainCategoryRowActions from "./main-category-row-actions";

export function createColumns(
  t: (k: string) => string,
  query: UseQueryResult
): ColumnDef<MainCategory>[] {
  return [
    {
      id: "main_category",
      accessorFn: (row) => row.name,
      header: t("main_categories"),
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
              {c.image && (
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
              )}
            </div>
            <p className="truncate font-bold text-foreground">{c.name}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "order",
      header: t("cat_sort_order"),
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums">{row.original.order}</span>
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
          <MainCategoryRowActions mainCategory={row.original} query={query} />
        </div>
      ),
    },
  ];
}
