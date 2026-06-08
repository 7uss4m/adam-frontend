import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
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
import { Product } from "../../types/types";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import putProductState from "../../api/putProductState";
import { AxiosError } from "axios";
import { useToast } from "../../components/ui/use-toast";
import DeleteProductForm from "./delete-product-form";
import EditProductForm from "./edit-product-form";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/input";

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
  // state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  const [t] = useTranslation("global");
  // toast
  const { toast } = useToast();
  // mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: { active: number; productId: string }) => {
      const response = await putProductState(
        localStorage.getItem("token") as string,
        data.productId,
        data.active
      );

      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result,
      });
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
      });
      query.refetch();
    },
  });

  return (
    <div className="rounded-md border">
      <div className="w-full flex items-center gap-5">
        <Input
          placeholder={t("search")}
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          defaultValue={""}
          className="w-full h-12 border-border border rounded-md"
        />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
                    {cell.column.id == "active" ? (
                      <Switch
                        onClick={(e) => {
                          updateProductMutation.mutate({
                            active:
                              e.currentTarget.dataset["state"] == "unchecked"
                                ? 1
                                : 0,
                            productId: e.currentTarget.id,
                          });
                        }}
                        id={(row.original as Product).id.toString()}
                        defaultChecked={cell.getValue() as boolean}
                      />
                    ) : cell.column.id == "image" ? (
                      <img
                        src={cell.getValue() as string}
                        alt={(row.original as Product).name}
                        className="size-[50px] rounded"
                      />
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
                <TableCell className="flex items-center justify-center gap-5">
                  <EditProductForm
                    id={(row.original as Product).id.toString()}
                    query={query}
                    product={row.original as Product}
                  />
                  <DeleteProductForm
                    query={query}
                    id={(row.original as Product).id.toString()}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end gap-2 mx-5 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {t("previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
