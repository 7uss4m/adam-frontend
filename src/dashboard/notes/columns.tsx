import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Clock, Coins, CreditCard, Mail, User } from "lucide-react";
import { UseQueryResult } from "@tanstack/react-query";

import { Button } from "../../components/ui/button";
import NoteRowActions from "./note-row-actions";
import NoteStatusBadge from "./note-status-badge";
import type { DashboardNote } from "./note-utils";
import { fmtCoins, formatNoteDate, relativeNoteTime } from "./note-utils";

export function createColumns(
  t: (k: string) => string,
  query: UseQueryResult,
  locale: string
): ColumnDef<DashboardNote>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>
      ),
    },
    {
      id: "user",
      accessorFn: (row) => row.username,
      header: t("users"),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-bold text-foreground">
            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {row.original.username}
          </p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            {row.original.email || "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "coins",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ms-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("amount")}
          <ArrowUpDown className="ms-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 font-orbitron text-sm font-black text-primary">
          <Coins className="h-3.5 w-3.5" />
          {fmtCoins(row.original.coins)}
        </span>
      ),
    },
    {
      accessorKey: "currencyName",
      header: t("currency") || "العملة",
      cell: ({ row }) => row.original.currencyName || t("deleted"),
    },
    {
      accessorKey: "boxName",
      header: t("charge_boxes"),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
          {row.original.boxName || t("deleted")}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ms-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("created_at") || "التاريخ"}
          <ArrowUpDown className="ms-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          <p className="flex items-center gap-1 font-medium text-foreground">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {relativeNoteTime(row.original.created_at, locale)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatNoteDate(row.original.created_at, locale)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => <NoteStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <NoteRowActions note={row.original} query={query} />,
    },
  ];
}
