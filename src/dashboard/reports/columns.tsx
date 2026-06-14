import { ColumnDef } from "@tanstack/react-table";
import { TFunction } from "i18next";
import { Report } from "../../types/types";

export function createColumns(t: TFunction): ColumnDef<Report>[] {
  return [
    {
      accessorKey: "categoryId",
      header: t("reports_category_id"),
    },
    {
      accessorKey: "categoryName",
      header: t("reports_category_name"),
    },
    {
      accessorKey: "totalQuantity",
      header: t("reports_total_quantity"),
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {row.original.totalQuantity}
        </span>
      ),
    },
    {
      accessorKey: "totalPrice",
      header: t("reports_total_price"),
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-primary">
          {row.original.totalPrice}
        </span>
      ),
    },
  ];
}
