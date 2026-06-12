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
import { Price, Product } from "../../types/types";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import putProductState from "../../api/putProductState";
import { AxiosError } from "axios";
import { useToast } from "../../components/ui/use-toast";
import DeleteProductForm from "./delete-product-form";
import EditProductForm from "./edit-product-form";
import OfferProductForm from "../products/offer-product-form";
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
                    {cell.column.id == "active" ? (
                      <Switch
                        dir="ltr"
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
                    ) : cell.column.id == "prices" ? (
                      <div>
                        {(cell.getValue() as Price[])?.map((price) => (
                          <div
                            key={price.payment_method.name}
                            className="flex gap-5 items-center"
                          >
                            <p className="name">{price.payment_method.name}</p>
                            <p className="price">{price.price} $</p>
                          </div>
                        ))}
                      </div>
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
                  <OfferProductForm
                    product={row.original as Product}
                    query={query}
                  />
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
                {t("no_results")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
