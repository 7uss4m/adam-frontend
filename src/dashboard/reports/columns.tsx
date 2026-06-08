
import { ColumnDef } from "@tanstack/react-table"
import { Report } from "../../types/types"




export const columns: ColumnDef<Report>[] = [


  {
    accessorKey: "categoryId",
    header: localStorage.getItem("lng") == "en" ? "Category Id" : "معرف التصنيف",
  },
  {
    accessorKey: "categoryName",
    header: localStorage.getItem("lng") == "en" ? "Category Name" : "اسم التصنيف",
  },
  {
    accessorKey: "totalQuantity",
    header: localStorage.getItem("lng") == "en" ? "Total Quantity" : "الكمية الكلية",
  },
  {
    accessorKey: "totalPrice",
    header: localStorage.getItem("lng") == "en" ? "Total Price" : "السعر الكلي",
  },
]
