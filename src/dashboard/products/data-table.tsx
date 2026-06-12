import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { cn } from "../../lib/utils";
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
      ? {
          pagination: {
            pageIndex: serverPagination.page - 1,
            pageSize: data.length || 10,
          },
        }
      : undefined,
  });

  const [t, i18n] = useTranslation("global");
  const isRtl = i18n.language !== "en";
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
    <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/90 shadow-sm backdrop-blur-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border/40 bg-gradient-to-l from-muted/70 via-muted/50 to-transparent hover:bg-muted/70"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="whitespace-nowrap py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
                <TableHead className="whitespace-nowrap py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("actions_label") || "إجراءات"}
                </TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => {
                const product = row.original as Product;
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "group border-b border-border/20 transition-colors duration-200",
                      "hover:bg-primary/[0.03]",
                      index % 2 === 0 ? "bg-transparent" : "bg-muted/15"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3.5">
                        {cell.column.id === "active" ? (
                          <div className="flex items-center gap-2">
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
                            <span
                              className={cn(
                                "text-[10px] font-semibold",
                                product.active
                                  ? "text-emerald-600"
                                  : "text-muted-foreground"
                              )}
                            >
                              {product.active
                                ? t("active")
                                : t("inactive") || "معطل"}
                            </span>
                          </div>
                        ) : cell.column.id === "image" ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-border/50 transition-all group-hover:ring-primary/30">
                            <img
                              src={getProductImageUrl(product.image)}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  getProductImageUrl(null);
                              }}
                            />
                          </div>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center justify-center gap-0.5 rounded-xl bg-muted/20 p-1 opacity-90 transition-opacity group-hover:opacity-100">
                        <OfferProductForm
                          product={product}
                          query={query}
                          compact
                        />
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
                  className="h-32 text-center text-muted-foreground"
                >
                  {t("no_results") || "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {serverPagination && (
        <div className="flex flex-col gap-3 border-t border-border/30 bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {t("showing") || "عرض"}{" "}
            <span className="font-bold text-foreground">{data.length}</span>{" "}
            {t("of") || "من"}{" "}
            <span className="font-bold text-foreground">
              {total.toLocaleString()}
            </span>
            {pageCount > 1 && (
              <>
                {" · "}
                {t("page") || "صفحة"}{" "}
                <span className="font-bold text-primary">{page}</span>/
                {pageCount}
              </>
            )}
          </p>
          {pageCount > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-xl border-border/60 px-3 text-xs"
                onClick={() => serverPagination.onPageChange(page - 1)}
                disabled={page <= 1}
              >
                {isRtl ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronLeft className="h-3.5 w-3.5" />
                )}
                {t("previous")}
              </Button>
              <div className="hidden items-center gap-1 sm:flex">
                {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                  let pageNum: number;
                  if (pageCount <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pageCount - 2) {
                    pageNum = pageCount - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => serverPagination.onPageChange(pageNum)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all",
                        pageNum === page
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-xl border-border/60 px-3 text-xs"
                onClick={() => serverPagination.onPageChange(page + 1)}
                disabled={page >= pageCount}
              >
                {t("next")}
                {isRtl ? (
                  <ChevronLeft className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
