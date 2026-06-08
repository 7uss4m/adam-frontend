
import { ColumnDef } from "@tanstack/react-table"
import { Charge } from "../../types/types"




export const columns: ColumnDef<Charge>[] = [


  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "user",
    header: localStorage.getItem("lng") == "en" ? "User" : "المستخدم",
  },
  {
    accessorKey: "coins",
    header: localStorage.getItem("lng") == "en" ? "Coins" : "العملات",
  },
  {
    accessorKey: "created_at",
    header: localStorage.getItem("lng") == "en" ? "Created At" : "تاريخ الانشاء",
  },
]
