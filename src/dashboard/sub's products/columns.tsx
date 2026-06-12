import { ColumnDef } from "@tanstack/react-table"
import { Product } from "../../types/types"
import { getOfferStatusText } from "../products/product-utils"
import i18next from "i18next"

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "Id" : "المعرف",
  },
  {
    accessorKey: "name",
    header: localStorage.getItem("lng") == "en" ? "Name" : "الاسم",
  },
  {
    accessorKey: "image",
    header: localStorage.getItem("lng") == "en" ? "Image" : "الصورة",
  },
  {
    accessorKey: "price",
    header: localStorage.getItem("lng") == "en" ? "Price" : "السعر",
  },
  {
    id: "offer",
    header: () => i18next.t("global:offer_status"),
    cell: ({ row }) => getOfferStatusText(row.original, (k) => i18next.t(`global:${k}`)),
  },
  {
    accessorKey: "active",
    header: localStorage.getItem("lng") == "en" ? "Active" : "فعال",
  },
]
