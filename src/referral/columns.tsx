

import { ColumnDef } from "@tanstack/react-table"
import { PointsHistory } from "../api/getReferralHistory"
import { format } from "date-fns"






// import DeleteForm from "./delete-form"

// import EditForm from "./edit-form"





export const columns: ColumnDef<PointsHistory>[] = [
  // translations


  {
    accessorKey: "id",
    header: localStorage.getItem("lng")=="en"?"Id":"المعرف",
  },
  {
    accessorKey: "points_earned",
    header: localStorage.getItem("lng")=="en"?"Points Earned":"النقاط المحصودة",
  },
  {
    accessorKey: "charge_amount",
    header: localStorage.getItem("lng")=="en"?"Charge Amount":"القيمة المشحونة",
  },
  {
    accessorKey: "percentage",
    header: localStorage.getItem("lng")=="en"?"Percentage":"النسبة",
    cell:({row})=>`${row.original.percentage}%`
  },
  {
    accessorKey: "created_at",
    header: localStorage.getItem("lng")=="en"?"Created At":"التاريخ",
    cell:({row})=>format(row.original.created_at,"MM/dd/yyyy")
  },
  {
    accessorKey: "referred.email",
    header: localStorage.getItem("lng")=="en"?"Email":"الإيميل",

  },

]
