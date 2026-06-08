import { ColumnDef } from "@tanstack/react-table";
import { Client } from "../../types/types";

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "name",
    header: localStorage.getItem("lng") == "en" ? "Name" : "الاسم",
  },
  {
    accessorKey: "balance",
    header: localStorage.getItem("lng") == "en" ? "Balance" : "الرصيد",
    cell: ({ row }) => {
      return row.original.balance.toFixed(2) + "$";
    },
  },
  {
    accessorKey: "active",
    header: localStorage.getItem("lng") == "en" ? "Active" : "مفعل",
  },
  {
    accessorKey: "created_at",
    header:
      localStorage.getItem("lng") == "en" ? "Created At" : "تاريخ الانشاء",
  },
];
