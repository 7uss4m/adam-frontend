
import { ColumnDef } from "@tanstack/react-table"
import { ChargeBox } from "../../types/types"




export const columns: ColumnDef<ChargeBox>[] = [


  {
    accessorKey: "id",
    header: localStorage.getItem("lng") == "en" ? "ID" : "المعرف",
  },
  {
    accessorKey: "name",
    header: localStorage.getItem("lng") == "en" ? "Name" : "الاسم",
  },
  {
    accessorKey: "account_name",
    header: localStorage.getItem("lng") == "en" ? "Account Name" : "اسم الحساب",
  },
  {
    accessorKey: "account_code",
    header: localStorage.getItem("lng") == "en" ? "Account Code" : "كود الحساب",
  },
  {
    accessorKey: "box_name",
    header: localStorage.getItem("lng") == "en" ? "Box Name" : "اسم الصندوق",
  },
  {
    accessorKey: "wallet_address",
    header: localStorage.getItem("lng") == "en" ? "Wallet Address" : "عنوان المحفظة",
  },
  {
    accessorKey: "description",
    header: localStorage.getItem("lng") == "en" ? "Description" : "الوصف",
  },
  {
    accessorKey: "image",
    header: localStorage.getItem("lng") == "en" ? "Image" : "الصورة",
  },
]
