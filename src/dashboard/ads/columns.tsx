import { ColumnDef } from "@tanstack/react-table"
import { Ad } from "../../types/types"

const isAr = () => localStorage.getItem("lng") !== "en";

export const columns: ColumnDef<Ad>[] = [
  {
    accessorKey: "id",
    header: () => isAr() ? "#" : "#",
  },
  {
    accessorKey: "title",
    header: () => isAr() ? "العنوان" : "Title",
  },
  {
    accessorKey: "description",
    header: () => isAr() ? "الوصف" : "Description",
  },
  {
    accessorKey: "image",
    header: () => isAr() ? "الصورة" : "Image",
  },
  {
    accessorKey: "active",
    header: () => isAr() ? "الحالة" : "Status",
  },
]
