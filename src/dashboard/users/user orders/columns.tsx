
import { ColumnDef } from "@tanstack/react-table"
import { Order } from "../../../types/types"



export const columns: ColumnDef<Order>[] = [

  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "email",
    header: localStorage.getItem("lng") == "en" ? "Email" : "الايميل",

  },
  {
    accessorKey: "productName",
    header: localStorage.getItem("lng") == "en" ? "Product" : "المنتج",
  },
  {
    accessorKey: "appId",
    header: localStorage.getItem("lng") == "en" ? "App Id" : "معرف التطبيق",
  },
  {
    accessorKey: "subCategory",
    header: localStorage.getItem("lng") == "en" ? "Application" : "التطبيق",
  },
  {
    accessorKey: "quantity",
    header: localStorage.getItem("lng") == "en" ? "Quantity" : "الكمية",
  },
  {
    accessorKey: "totalPrice",
    header: localStorage.getItem("lng") == "en" ? "Price" : "السعر",
  },
  {
    accessorKey: "total",
    header: localStorage.getItem("lng") == "en" ? "Total Price" : "السعر الكلي",
  },
  {
    accessorKey: "date",
    header: localStorage.getItem("lng") == "en" ? "Date" : "التاريخ",
  },
  {
    accessorKey: "status",
    header: localStorage.getItem("lng") == "en" ? "Status" : "الحالة",
  },
  {
    accessorKey: "pay_done",
    header: localStorage.getItem("lng") == "en" ? "Pay Done" : "حالة الدفع",
  }
]
