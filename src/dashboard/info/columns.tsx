import { ColumnDef } from "@tanstack/react-table";
import { Info } from "../../types/types";

export const columns: ColumnDef<Info>[] = [
  {
    accessorKey: "dollar_exchange",
    header: localStorage.getItem("lng") == "en" ? "Dollar" : "قيمة الدولار",
  },
  {
    accessorKey: "code",
    header:
      localStorage.getItem("lng") == "en" ? "Wallet Address" : "عنوان المحفظة",
  },
  {
    accessorKey: "email",
    header: localStorage.getItem("lng") == "en" ? "Email" : "الايميل",
  },
  {
    accessorKey: "phone",
    header: localStorage.getItem("lng") == "en" ? "Phone" : "الموبايل",
  },
  {
    accessorKey: "privacy",
    header: localStorage.getItem("lng") == "en" ? "Privacy" : "الخصوصية",
  },
  {
    accessorKey: "aboutus",
    header: localStorage.getItem("lng") == "en" ? "About Us" : "من نحن",
  },
  {
    accessorKey: "whatsup",
    header: localStorage.getItem("lng") == "en" ? "Whatsapp" : "واتساب",
  },
  {
    accessorKey: "telegram",
    header: localStorage.getItem("lng") == "en" ? "Telegram" : "تيليغرام",
  },
  {
    accessorKey: "facebook",
    header: localStorage.getItem("lng") == "en" ? "Facebook" : "الفيسبوك",
  },
];
