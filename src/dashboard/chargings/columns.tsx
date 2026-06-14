import { ColumnDef } from "@tanstack/react-table";
import { TFunction } from "i18next";

import { cn } from "../../lib/utils";
import {
  chargeStatusLabel,
  chargeTypeLabel,
  DashboardCharge,
  fmtCoins,
  formatChargeDate,
} from "./charge-utils";

export function createColumns(
  t: TFunction,
  locale: string
): ColumnDef<DashboardCharge>[] {
  return [
    {
      accessorKey: "id",
      header: t("charges_id"),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>
      ),
    },
    {
      id: "user",
      header: t("users"),
      cell: ({ row }) => (
        <div className="min-w-[140px]">
          <p className="truncate font-semibold text-foreground">
            {row.original.user?.user_name || t("deleted")}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.user?.email || "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "coins",
      header: t("charges_amount"),
      cell: ({ row }) => {
        const v = row.original.coins;
        return (
          <span
            className={cn(
              "font-bold tabular-nums",
              v < 0 ? "text-destructive" : "text-primary"
            )}
          >
            {v < 0 ? "" : "+"}
            {fmtCoins(v)}
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: t("charges_type"),
      cell: ({ row }) => (
        <span className="text-xs font-semibold">
          {chargeTypeLabel(row.original.type, t)}
        </span>
      ),
    },
    {
      accessorKey: "done",
      header: t("charges_status"),
      cell: ({ row }) => (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold",
            row.original.done
              ? "bg-emerald-500/15 text-emerald-600"
              : "bg-amber-500/15 text-amber-600"
          )}
        >
          {chargeStatusLabel(row.original.done, t)}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("charges_date"),
      cell: ({ row }) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatChargeDate(row.original.created_at, locale)}
        </span>
      ),
    },
  ];
}
