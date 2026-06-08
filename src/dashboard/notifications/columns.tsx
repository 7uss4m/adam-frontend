import { ColumnDef } from "@tanstack/react-table";
import { Notification } from "../../types/types";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../../components/ui/button";

export const columns: ColumnDef<Notification>[] = [
  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "title",
    header: localStorage.getItem("lng") == "en" ? "Title" : "العنوان",
  },
  {
    accessorKey: "content",
    header: localStorage.getItem("lng") == "en" ? "Content" : "المحتوى",
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
]; 