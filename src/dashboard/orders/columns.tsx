import { ColumnDef } from "@tanstack/react-table";
import { Order } from "../../types/types";
import { format } from "date-fns";

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
    accessorKey: "client",
    header: localStorage.getItem("lng") == "en" ? "Client" : "العميل",
    cell: ({ row }) => {
      return <div>{!row.original.user ? row.original.client?.name : "-"}</div>;
    },
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
    accessorKey: "area.name",
    header: localStorage.getItem("lng") == "en" ? "Area" : "شركة الشحن",
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
    cell: ({ row }) =>
      format(new Date(row.original.created_at), "yyyy-MM-dd HH:mm:ss"),
  },
  {
    accessorKey: "status",
    header: localStorage.getItem("lng") == "en" ? "Status" : "الحالة",
  },
  {
    accessorKey: "pay_done",
    header: localStorage.getItem("lng") == "en" ? "Pay Done" : "حالة الدفع",
  },
];
