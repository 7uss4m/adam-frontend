

import { ColumnDef } from "@tanstack/react-table"
import { User } from "../../types/types"






// import DeleteForm from "./delete-form"

// import EditForm from "./edit-form"





export const columns: ColumnDef<User>[] = [
  // translations


  {
    accessorKey: "id",
    header: localStorage.getItem("lng")=="en"?"Id":"المعرف",
  },
  {
    accessorKey: "user_name",
    header: localStorage.getItem("lng")=="en"?"Username":"اسم المستخدم",
  },
  {
    accessorKey: "email",
    header: localStorage.getItem("lng")=="en"?"Email":"الايميل",
  },
  
]
