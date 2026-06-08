
import { ColumnDef } from "@tanstack/react-table"
import { Category } from "../../types/types"
// import EditForm from "./edit-form"





export const columns: ColumnDef<Category>[] = [


  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "name",
    header: localStorage.getItem("lng") == "en" ? "Name" : "الاسم",
  },
  {
    accessorKey: "order",
    header: localStorage.getItem("lng") == "en" ? "Order" : "الترتيب",
  },
  {
    accessorKey: "image",
    header: localStorage.getItem("lng") == "en" ? "Image" : "الصورة",
  },
  // {
  //   accessorKey: "visible",
  //   header: "Visible",
  // },

]
