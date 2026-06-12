import { Link } from "react-router-dom";
import { UseQueryResult } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Layers,
  Package,
  Tags,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { DashboardSubCategory } from "./sub-utils";
import { categoryAccent, categoryInitials, subTypeLabel } from "./sub-utils";
import { Badge } from "../../../components/ui/badge";
import SubCategoryRowActions from "./sub-category-row-actions";
import { cn } from "../../../lib/utils";

type SubCategoryCardProps = {
  sub: DashboardSubCategory;
  query: UseQueryResult;
};

export default function SubCategoryCard({ sub, query }: SubCategoryCardProps) {
  const [t] = useTranslation("global");
  const accent = categoryAccent(sub.id);
  const isActive = sub.active !== false;
  const products = sub.product_count ?? 0;

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
              {sub.image ? (
                <img src={sub.image} alt={sub.name} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                  }}
                >
                  {categoryInitials(sub.name)}
                </div>
              )}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">{sub.name}</p>
              <p className="font-mono text-xs text-muted-foreground">#{sub.id}</p>
            </div>
          </div>
          <SubCategoryRowActions sub={sub} query={query} compact />
        </div>

        {sub.parent_name && (
          <div className="relative mt-3 flex items-center gap-1.5 rounded-xl border border-border/40 bg-background/50 px-3 py-2">
            <Tags className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs text-muted-foreground">
              {t("parent_category")}:
            </span>
            <span className="truncate text-xs font-bold text-foreground">
              {sub.parent_name}
            </span>
          </div>
        )}

        <div className="relative mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              {t("products")}
            </p>
            <p className="flex items-center gap-1 text-lg font-black tabular-nums">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              {products}
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              {t("type")}
            </p>
            <p className="text-sm font-bold capitalize">{subTypeLabel(sub.type, t)}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              {t("bonus")}
            </p>
            <p className="text-sm font-black tabular-nums">{sub.bonus ?? 0}%</p>
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
            {t("cat_sort_order")}: {sub.order}
          </Badge>
          {sub.source && (
            <Badge variant="secondary" className="text-[10px] font-bold capitalize">
              {sub.source}
            </Badge>
          )}
        </div>

        <div className="relative mt-4 flex items-center justify-end gap-2 border-t border-border/40 pt-4">
          <Link
            to={`${sub.id}/products`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
          >
            <Package className="h-3.5 w-3.5" />
            {t("products")}
          </Link>
          {sub.parent_id && (
            <Link
              to={`../${sub.parent_id}/sub`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/50 px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              <Layers className="h-3.5 w-3.5" />
              {t("parent_category")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
