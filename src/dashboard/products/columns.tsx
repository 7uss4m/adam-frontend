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
  offer_active_status: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  offer_scheduled: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  offer_expired: "border-border bg-muted text-muted-foreground",
  offer_none: "border-border bg-secondary/50 text-muted-foreground",
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: () => i18next.t("global:product_id") || "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
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
        className="h-12 w-12 rounded-lg border border-border/50 object-cover"
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
      <div className="min-w-[140px] space-y-0.5">
        <p className="font-semibold text-foreground line-clamp-1">
          {row.original.name}
        </p>
        {row.original.categories?.name && (
          <p className="text-xs text-muted-foreground line-clamp-1">
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
        <p className="font-bold text-primary">
          ${Number(row.original.price).toFixed(2)}
        </p>
        {row.original.mainPrice &&
          Number(row.original.mainPrice) > Number(row.original.price) && (
            <p className="text-xs text-muted-foreground line-through">
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
        <Badge variant="outline" className="text-[10px]">
          {row.original.source}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
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
      <Badge variant={row.original.active ? "accept" : "destructive"} className="text-[10px]">
        {row.original.active
          ? i18next.t("global:active")
          : i18next.t("global:inactive") || "Inactive"}
      </Badge>
    ),
  },
];

export { isOfferCurrentlyActive };
