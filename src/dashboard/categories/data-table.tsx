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
import { Switch } from "../../components/ui/switch";
import { UseQueryResult } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import DeleteCategoryForm from "./delete-category-form";
import { Category } from "../../types/types";
import EditCategoryForm from "./edit-category-form";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface DataTableProps<Category, TValue> {
  columns: ColumnDef<Category, TValue>[];
  data: Category[];
  query: UseQueryResult

}

export function DataTable<TData, TValue>({
  columns,
  data,
  query
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
        <TableHeader >
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
                    {cell.column.id == "visible" ? (
                      <Switch defaultChecked={cell.getValue() as boolean} />
                    ) : cell.column.id == "image" ? (
                      <img
                        alt={cell.id}
                        src={cell.getValue() as string}
                        className="size-[40px] rounded"
                      />
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
                <TableCell className="flex justify-center items-center gap-5">
                  <DeleteCategoryForm query={query} category={row.original as Category} />
                  <EditCategoryForm query={query} category={row.original as Category} />
                  <Button>
                    <Link to={{ pathname: `${(row.original as Category).id}/sub` }}>{t("sub_categories")}</Link>
                  </Button>
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
