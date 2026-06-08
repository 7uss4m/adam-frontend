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
import { useMutation, UseQueryResult } from "@tanstack/react-query";
import { Charge, Client } from "../../types/types";
import { useTranslation } from "react-i18next";
import EditClientForm from "./edit-client-form";
import { Switch } from "../../components/ui/switch";
import { useToast } from "../../components/ui/use-toast";
import patchClient from "../../api/putClient";
import { AxiosError } from "axios";
import RegenerateApiKey from "./regenerate-api-key";

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

  // toast
  const { toast } = useToast();
  // mutation
  const updateClientMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      balance: number;
      active: boolean;
      id: string;
    }) => {
      const response = await patchClient(
        { name: data.name, balance: data.balance, active: data.active },
        data.id,
        localStorage.getItem("token") as string
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
                    {cell.column.id == "active" ? (
                      <Switch
                        dir="ltr"
                        onClick={(e) => {
                          updateClientMutation.mutate({
                            balance: (row.original as Client).balance,
                            name: (row.original as Client).name,
                            active:
                              e.currentTarget.dataset["state"] == "unchecked"
                                ? true
                                : false,
                            id: e.currentTarget.id,
                          });
                        }}
                        id={(row.original as Client).id.toString()}
                        defaultChecked={cell.getValue() as boolean}
                      />
                    ) : cell.column.id == "created_at" ? (
                      (row.original as Charge).created_at.slice(0, 10)
                    ) : cell.column.id == "user" ? (
                      (row.original as Charge).user?.email ? (
                        (row.original as Charge).user?.email
                      ) : (
                        t("deleted")
                      )
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
                <TableCell className="flex justify-center items-center gap-5">
                  {/* <DeleteCategoryForm
                    query={query}
                    category={row.original as Category}
                  /> */}
                  <EditClientForm
                    query={query}
                    client={row.original as Client}
                  />
                  <RegenerateApiKey client={row.original as Client} />
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
