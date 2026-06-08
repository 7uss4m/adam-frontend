

import { ColumnDef } from "@tanstack/react-table"
import { User } from "../../types/types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../../components/ui/button"





export const columns: ColumnDef<User>[] = [


  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "user_name",
    header: localStorage.getItem("lng") == "en" ? "username" : "اسم المستخدم",
  },
  {
    accessorKey: "email",
    header: localStorage.getItem("lng") == "en" ? "Email" : "الايميل",
  },
  {
    accessorKey: "balance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {localStorage.getItem("lng") == "en" ? "Balance" : "الميزانية"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "bonus",
    header: localStorage.getItem("lng") == "en" ? "Bonus" : "العلاوة",
  },
  {
    accessorKey: "level",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {localStorage.getItem("lng") == "en" ? "Level" : "المستوى"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "debit",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {localStorage.getItem("lng") == "en" ? "Debit" : "الدين"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  }

]
