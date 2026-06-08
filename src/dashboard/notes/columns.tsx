import { ColumnDef } from "@tanstack/react-table";
import { Note } from "../../types/types";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../../components/ui/button";

export const columns: ColumnDef<Note>[] = [
  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "coins",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {localStorage.getItem("lng") == "en" ? "Coins" : "الكمية"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },

  {
    accessorKey: "currencyName",
    header: localStorage.getItem("lng") == "en" ? "Currency" : "العملة",
  },
  {
    accessorKey: "boxName",
    header: localStorage.getItem("lng") == "en" ? "Box Name" : "اسم الصندوق",
  },
  {
    accessorKey: "username",
    header: localStorage.getItem("lng") == "en" ? "User" : "المستخدم",
  },
  {
    accessorKey: "email",
    header: localStorage.getItem("lng") == "en" ? "Email" : "الايميل",
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {localStorage.getItem("lng") == "en" ? "Created At" : "تاريخ الانشاء"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at") as string);
      const formattedDate = date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "status",
    header: localStorage.getItem("lng") == "en" ? "Status" : "الحالة",
  },
];
