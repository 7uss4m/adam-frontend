import { ColumnDef } from "@tanstack/react-table";
import { Product } from "../../types/types";
import { Badge } from "../../components/ui/badge";
import {
  getOfferStatusKey,
  getOfferStatusText,
  getProductImageUrl,
  isOfferCurrentlyActive,
} from "./product-utils";
import i18next from "i18next";

const offerBadgeClass: Record<string, string> = {
  offer_active_status:
    "border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 dark:text-cyan-300",
  offer_scheduled:
    "border-blue-500/30 bg-gradient-to-r from-blue-500/15 to-indigo-500/10 text-blue-700 dark:text-blue-300",
  offer_expired: "border-border bg-muted/80 text-muted-foreground",
  offer_none: "border-border/60 bg-muted/40 text-muted-foreground",
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: () => i18next.t("global:product_id") || "ID",
    cell: ({ row }) => (
      <span className="inline-flex rounded-lg bg-muted/50 px-2 py-1 font-mono text-[11px] font-semibold text-muted-foreground">
        #{row.original.id}
      </span>
    ),
  },
  {
    accessorKey: "image",
    header: () => i18next.t("global:image") || "Image",
    cell: ({ row }) => (
      <img
        src={getProductImageUrl(row.original.image)}
        alt={row.original.name}
        className="h-12 w-12 rounded-xl border border-border/50 object-cover shadow-sm"
        onError={(e) => {
          (e.target as HTMLImageElement).src = getProductImageUrl(null);
        }}
      />
    ),
  },
  {
    accessorKey: "name",
    header: () => i18next.t("global:name") || "Name",
    cell: ({ row }) => (
      <div className="min-w-[160px] space-y-0.5">
        <p className="line-clamp-1 font-bold tracking-tight text-foreground">
          {row.original.name}
        </p>
        {row.original.categories?.name && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {row.original.categories.name}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: () => i18next.t("global:price") || "Price",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="text-base font-black tabular-nums text-primary">
          ${Number(row.original.price).toFixed(2)}
        </p>
        {row.original.mainPrice &&
          Number(row.original.mainPrice) > Number(row.original.price) && (
            <p className="text-xs tabular-nums text-muted-foreground line-through">
              ${Number(row.original.mainPrice).toFixed(2)}
            </p>
          )}
      </div>
    ),
  },
  {
    id: "source",
    header: () => i18next.t("global:source") || "Source",
    cell: ({ row }) =>
      row.original.source ? (
        <Badge
          variant="outline"
          className="rounded-lg border-border/60 bg-muted/30 text-[10px] font-semibold"
        >
          {row.original.source}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground/60">—</span>
      ),
  },
  {
    id: "offer",
    header: () => i18next.t("global:offer_status"),
    cell: ({ row }) => {
      const key = getOfferStatusKey(row.original);
      return (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${offerBadgeClass[key]}`}
        >
          {getOfferStatusText(row.original, (k) => i18next.t(`global:${k}`))}
        </span>
      );
    },
  },
  {
    accessorKey: "active",
    header: () => i18next.t("global:active"),
    cell: ({ row }) => (
      <Badge
        variant={row.original.active ? "accept" : "destructive"}
        className="rounded-lg text-[10px]"
      >
        {row.original.active
          ? i18next.t("global:active")
          : i18next.t("global:inactive") || "Inactive"}
      </Badge>
    ),
  },
];

export { isOfferCurrentlyActive };
