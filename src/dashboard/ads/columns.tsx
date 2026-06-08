
import { ColumnDef } from "@tanstack/react-table"
import { Ad } from "../../types/types"




export const columns: ColumnDef<Ad>[] = [


  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "title",
    header: localStorage.getItem("lng") == "en" ? "Link" : "الرابط",
  },
  {
    accessorKey: "description",
    header: localStorage.getItem("lng") == "en" ? "Description" : "الوصف",
  },
  {
    accessorKey: "image",
    header: localStorage.getItem("lng") == "en" ? "Image" : "الصورة",
  },
  {
    accessorKey: "active",
    header: localStorage.getItem("lng") == "en" ? "Active" : "فعال",
  },

]
