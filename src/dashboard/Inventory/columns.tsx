
import { ColumnDef } from "@tanstack/react-table"
import { Inventory } from "../../types/types"




export const columns: ColumnDef<Inventory>[] = [


  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "total_quantity",
    header: localStorage.getItem("lng") == "en" ? "Total Quantity" : "الكمية الكلية",
  },
  {
    accessorKey: "total_price",
    header: localStorage.getItem("lng") == "en" ? "Total Price" : "السعر الكلي",
  },
  {
    accessorKey: "categories",
    header: localStorage.getItem("lng") == "en" ? "Categories" : "التصنيفات",
  },
  {
    accessorKey: "created_at",
    header: localStorage.getItem("lng") == "en" ? "Created At" : "تاريخ الانشاء",
  },
]
