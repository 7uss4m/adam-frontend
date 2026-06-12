import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

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
import putProductState from "../../api/putProductState";
import { useToast } from "../../components/ui/use-toast";
import DeleteProductForm from "./delete-product-form";
import EditProductForm from "./edit-product-form";
import OfferProductForm from "./offer-product-form";
import { Button } from "../../components/ui/button";
import { getProductImageUrl } from "./product-utils";

type ServerPagination = {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  query: UseQueryResult;
  serverPagination?: ServerPagination;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  query,
  serverPagination,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: Boolean(serverPagination),
    pageCount: serverPagination?.pageCount ?? -1,
    state: serverPagination
      ? { pagination: { pageIndex: serverPagination.page - 1, pageSize: data.length || 10 } }
      : undefined,
  });

  const [t] = useTranslation("global");
  const { toast } = useToast();

  const updateProductMutation = useMutation({
    mutationFn: async (payload: { active: number; productId: string }) => {
      return putProductState(
        localStorage.getItem("token") as string,
        payload.productId,
        payload.active
      );
    },
    onSuccess: (data) => {
      toast({
        title: t("done") || "Done!",
        description: data.data.result,
      });
      query.refetch();
    },
    onError: (error: AxiosError) => {
      toast({
        title: t("error") || "Error!",
        description: (error.response?.data as { error: string }).error,
        variant: "destructive",
      });
      query.refetch();
    },
  });

  const page = serverPagination?.page ?? 1;
  const pageCount = serverPagination?.pageCount ?? 1;
  const total = serverPagination?.total ?? data.length;

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-xs font-bold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
              <TableHead className="text-center text-xs font-bold">
                {t("actions_label") || "إجراءات"}
              </TableHead>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const product = row.original as Product;
              return (
                <TableRow
                  key={row.id}
                  className="transition-colors hover:bg-muted/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {cell.column.id === "active" ? (
                        <Switch
                          dir="ltr"
                          checked={product.active}
                          disabled={updateProductMutation.isPending}
                          onCheckedChange={(checked) => {
                            updateProductMutation.mutate({
                              active: checked ? 1 : 0,
                              productId: product.id.toString(),
                            });
                          }}
                          id={product.id.toString()}
                        />
                      ) : cell.column.id === "image" ? (
                        <img
                          src={getProductImageUrl(product.image)}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg border border-border/50 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              getProductImageUrl(null);
                          }}
                        />
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <OfferProductForm product={product} query={query} compact />
                      <EditProductForm
                        id={product.id.toString()}
                        query={query}
                        product={product}
                        compact
                      />
                      <DeleteProductForm
                        query={query}
                        id={product.id.toString()}
                        compact
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="h-28 text-center text-muted-foreground"
              >
                {t("no_results") || "No results."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {serverPagination && (
        <div className="flex flex-col gap-3 border-t border-border/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {t("showing") || "عرض"} {data.length} {t("of") || "من"} {total}
            {pageCount > 1 && ` · ${t("page") || "صفحة"} ${page}/${pageCount}`}
          </p>
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => serverPagination.onPageChange(page - 1)}
                disabled={page <= 1}
              >
                {t("previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => serverPagination.onPageChange(page + 1)}
                disabled={page >= pageCount}
              >
                {t("next")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
