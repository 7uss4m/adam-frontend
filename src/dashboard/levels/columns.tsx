
import { ColumnDef } from "@tanstack/react-table"
import { Level } from "../../types/types"




export const columns: ColumnDef<Level>[] = [


  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "name",
    header: localStorage.getItem("lng") == "en" ? "Name" : "الاسم",
  },
  {
    accessorKey: "max",
    header: localStorage.getItem("lng") == "en" ? "Max" : "الحد الاقصى",
  },
  {
    accessorKey: "profit",
    header: localStorage.getItem("lng") == "en" ? "Profit" : "نسبة الربح",
  },
]
