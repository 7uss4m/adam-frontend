
import { ColumnDef } from "@tanstack/react-table"
import { Product } from "../../types/types"




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
    accessorKey: "prices",
    header: localStorage.getItem("lng") == "en" ? "Prices" : "الاسعار",
  },
  {
    accessorKey: "active",
    header: localStorage.getItem("lng") == "en" ? "Active" : "فعال",
  },

]
