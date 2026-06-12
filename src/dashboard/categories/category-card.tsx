import { Link } from "react-router-dom";
import { UseQueryResult } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  FolderTree,
  Layers,
  Package,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { DashboardCategory } from "./category-utils";
import { categoryAccent, categoryInitials } from "./category-utils";
import { Badge } from "../../components/ui/badge";
import CategoryRowActions from "./category-row-actions";
import { cn } from "../../lib/utils";

type CategoryCardProps = {
  category: DashboardCategory;
  query: UseQueryResult;
};

export default function CategoryCard({ category, query }: CategoryCardProps) {
  const [t] = useTranslation("global");
  const accent = categoryAccent(category.id);
  const isActive = category.active !== false;
  const subs = category.sub_count ?? 0;
  const products = category.product_count ?? 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card/80 transition-all hover:-translate-y-0.5 hover:shadow-lg",
        isActive
          ? "border-border/50 hover:border-primary/30"
          : "border-border/30 opacity-80 hover:border-amber-500/30"
      )}
    >
      <div
        className="pointer-events-none absolute -end-10 -top-10 h-36 w-36 rounded-full blur-2xl opacity-30 transition-opacity group-hover:opacity-50"
        style={{ backgroundColor: accent }}
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-muted">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                  }}
                >
                  {categoryInitials(category.name)}
                </div>
              )}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">{category.name}</p>
              <p className="font-mono text-xs text-muted-foreground">#{category.id}</p>
            </div>
          </div>
          <CategoryRowActions category={category} query={query} compact />
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
              <Layers className="h-3 w-3" />
              {t("sub_categories")}
            </p>
            <p className="text-lg font-black tabular-nums text-foreground">{subs}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
              <Package className="h-3 w-3" />
              {t("products")}
            </p>
            <p className="text-lg font-black tabular-nums text-foreground">{products}</p>
          </div>
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "border-0 text-[10px] font-bold",
              isActive
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            )}
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
          <Badge variant="outline" className="text-[10px] font-bold">
          {t("cat_sort_order")}: {category.order}
          </Badge>
          {category.source && (
            <Badge variant="secondary" className="text-[10px] font-bold capitalize">
              {category.source}
            </Badge>
          )}
          {category.external_id && (
            <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
              ext #{category.external_id}
            </Badge>
          )}
        </div>

        <div className="relative mt-4 flex items-center justify-end gap-2 border-t border-border/40 pt-4">
          <Link
            to={`${category.id}/sub`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
          >
            <FolderTree className="h-3.5 w-3.5" />
            {t("sub_categories")}
          </Link>
        </div>
      </div>
    </div>
  );
}
