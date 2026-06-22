import { ColumnDef } from "@tanstack/react-table";
import { User } from "../../types/types";
import { PERMISSION_LABEL_KEYS } from "./permissions-config";

const lng = localStorage.getItem("lng") || "ar";
const isEn = lng === "en";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: isEn ? "Id" : "المعرف",
  },
  {
    accessorKey: "user_name",
    header: isEn ? "Username" : "اسم المستخدم",
  },
  {
    accessorKey: "email",
    header: isEn ? "Email" : "الايميل",
  },
  {
    accessorKey: "permissions",
    header: isEn ? "Permissions" : "الصلاحيات",
    cell: ({ row }) => {
      const permissions = row.original.permissions || [];
      if (permissions.length === 0) {
        return (
          <span className="text-xs text-muted-foreground">
            {isEn ? "No Permissions" : "بدون صلاحيات"}
          </span>
        );
      }

      const displayPerms = permissions.slice(0, 4);
      const remaining = permissions.length - 4;

      return (
        <div className="flex flex-wrap gap-1">
          {displayPerms.map((perm) => (
            <span
              key={perm}
              className="inline-flex items-center rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400"
            >
              {isEn
                ? (PERMISSION_LABEL_KEYS[perm] ? perm : perm)
                : perm}
            </span>
          ))}
          {remaining > 0 && (
            <span className="inline-flex items-center rounded-md border border-[#1a2a44] bg-[#050B14] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{remaining}
            </span>
          )}
        </div>
      );
    },
  },
];
