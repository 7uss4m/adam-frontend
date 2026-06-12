import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, ShieldAlert } from "lucide-react";
import { UseQueryResult } from "@tanstack/react-query";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import type { User } from "../../types/types";
import UserRowActions from "./user-row-actions";
import { fmtUsd, getLevelColor, userInitials } from "./user-utils";

export function createColumns(
  t: (k: string) => string,
  query: UseQueryResult
): ColumnDef<User>[] {
  return [
    {
      id: "user",
      accessorFn: (row) => row.user_name,
      header: t("users") || "المستخدم",
      cell: ({ row }) => {
        const u = row.original;
        const color = getLevelColor(u.level?.name);
        return (
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
            >
              {userInitials(u.user_name, u.email)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">{u.user_name}</p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>
      ),
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ms-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("balance") || "الرصيد"}
          <ArrowUpDown className="ms-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-orbitron text-sm font-black text-emerald-400">
          {fmtUsd(Number(row.original.balance))}
        </span>
      ),
    },
    {
      accessorKey: "bonus",
      header: t("bonus") || "العلاوة",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{Number(row.original.bonus).toFixed(2)}</span>
      ),
    },
    {
      id: "level",
      accessorFn: (row) => row.level?.name,
      header: t("level") || "المستوى",
      cell: ({ row }) => {
        const name = row.original.level?.name;
        if (!name) return "—";
        const color = getLevelColor(name);
        return (
          <Badge
            variant="outline"
            className="gap-1 border-0 font-bold capitalize"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {t(name.toLowerCase())}
          </Badge>
        );
      },
    },
    {
      accessorKey: "debit",
      header: t("debit_balance") || "الدين",
      cell: ({ row }) => {
        const debit = Number(row.original.debit || 0);
        if (debit <= 0) {
          return <span className="text-xs text-muted-foreground">{t("not_allowed")}</span>;
        }
        return (
          <span className="font-orbitron text-sm font-bold text-rose-400">
            {fmtUsd(debit)}
          </span>
        );
      },
    },
    {
      id: "status",
      header: t("status") || "الحالة",
      cell: ({ row }) => {
        const u = row.original as User & { verify_admin?: boolean };
        return u.verify_admin ? (
          <Badge className="gap-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20">
            <BadgeCheck className="h-3 w-3" />
            {t("verified") || "موثّق"}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <ShieldAlert className="h-3 w-3" />
            {t("pending") || "معلق"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <UserRowActions user={row.original} query={query} />,
    },
  ];
}
