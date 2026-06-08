
import { ColumnDef } from "@tanstack/react-table"
import { Order } from "../../../types/types"




export const columns: ColumnDef<Order>[] = [

  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "appId",
    header: localStorage.getItem("lng") == "en" ? "App Id" : "معرف المستخدم",
  },
  // {
  //   accessorKey: "user",
  //   header: "User",
  // },
  // {
  //   accessorKey: "username",
  //   header: "Userame",
  // },
  {
    accessorKey: "product",
    header: localStorage.getItem("lng") == "en" ? "Product" : "المنتج",

  },
  {
    accessorKey: "totalPrice",
    header: localStorage.getItem("lng") == "en" ? "Price" : "السعر",

  },
  {
    accessorKey: "date",
    header: localStorage.getItem("lng") == "en" ? "Date" : "التاريخ",
  },
  {
    accessorKey: "status",
    header: localStorage.getItem("lng") == "en" ? "Status" : "الحالة",
  }
]
