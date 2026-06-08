
import { ColumnDef } from "@tanstack/react-table"
import { Product } from "../../types/types"




export const columns: ColumnDef<Product>[] = [


  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "image",
    header: "Image",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "active",
    header: "Active",
  },
  
]
