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
import { ChargeBox } from "../../types/types";
import EditBoxForm from "./edit-box-form";
import DeleteBoxForm from "./delete-box-form";
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
  const [t, i18n] = useTranslation("global")
  return (
    <div dir={i18n.language == "en" ? "ltr" : "rtl"} className="rounded-md border">
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
                    {cell.column.id == "account_code" ? (
                      (row.original as ChargeBox).account_code ? (
                        (row.original as ChargeBox).account_code
                      ) : (
                        t("no_account_code")
                      )
                    ) : cell.column.id == "account_name" ? (
                      (row.original as ChargeBox).account_code ? (
                        (row.original as ChargeBox).account_code
                      ) : (
                        t("no_account_name")
                      )
                    ) : cell.column.id == "box_name" ? (
                      (row.original as ChargeBox).box_name ? (
                        (row.original as ChargeBox).box_name
                      ) : (
                        t("no_account_name")
                      )
                    ) : cell.column.id == "wallet_address" ? (
                      (row.original as ChargeBox).wallet_address ? (
                        (row.original as ChargeBox).wallet_address
                      ) : (
                        t("no_account_name")
                      )
                    ) : cell.column.id == "image" ? (
                      <img
                        className="size-[30px]"
                        src={(row.original as ChargeBox).image as string}
                        alt=""
                      />
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
                <TableCell className="flex items-center justify-center gap-5">
                  <EditBoxForm query={query} box={row.original as ChargeBox} />
                  <DeleteBoxForm
                    query={query}
                    id={(row.original as ChargeBox).id}
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
