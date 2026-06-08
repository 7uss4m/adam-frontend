import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { UseQueryResult } from "@tanstack/react-query";
import { Inventory } from "../../types/types";
import EditInventoryForm from "./edit-inventory-form";
import DeleteInventoryForm from "./delete-inventory-form";
import { useTranslation } from "react-i18next";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  query: UseQueryResult;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  query,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // translation
  const [t, i18n] = useTranslation("global");

  return (
    <div
      dir={i18n.language == "en" ? "ltr" : "rtl"}
      className="rounded-md border"
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead className="text-start" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {cell.column.id == "total_price"
                      ? (row.original as Inventory).total_price + "$"
                      : cell.column.id == "categories"
                        ? (row.original as Inventory).categories?.name
                          ? (row.original as Inventory).categories?.name
                          : t("deleted")
                        : cell.column.id == "created_at"
                          ? (row.original as Inventory).created_at.slice(0, 10)
                          : flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                  </TableCell>
                ))}
                <TableCell className="flex items-center justify-center gap-5">
                  <EditInventoryForm
                    inventory={row.original as Inventory}
                    query={query}
                  />
                  <DeleteInventoryForm
                    query={query}
                    inventory={row.original as Inventory}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("no_results")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
