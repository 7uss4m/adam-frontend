import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Switch } from "../../components/ui/switch";
import { Ad } from "../../types/types";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useToast } from "../../components/ui/use-toast";
import EditAdForm from "./edit-ad-form";
import DeleteAdForm from "./delete-ad-form";
import putAdState from "../../api/putAdState";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslation } from "react-i18next";
import { ImageOff } from "lucide-react";
import logo from "../../assets/logo.webp";

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

  const { toast } = useToast();

  const updateAdStateMutation = useMutation({
    mutationFn: async (data: { active: number; id: string }) => {
      const response = await putAdState(
        localStorage.getItem("token") as string,
        data.id,
        data.active
      );
      return response;
    },
    onSuccess: (data) => {
      toast({ title: "Done!", description: data.data.result });
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
        variant: "destructive",
      });
      query.refetch();
    },
  });

  const [t, i18n] = useTranslation("global");

  return (
    <div
      dir={i18n.language === "en" ? "ltr" : "rtl"}
      className="rounded-xl border border-border/60 overflow-hidden shadow-sm"
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-secondary/50 hover:bg-secondary/50">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-start text-xs font-bold text-muted-foreground uppercase tracking-wider py-4"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
              <TableHead className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-4">
                {t("actions") || "الإجراءات"}
              </TableHead>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="transition-colors hover:bg-secondary/30 border-b border-border/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    {cell.column.id === "active" ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          dir="ltr"
                          onClick={(e) => {
                            updateAdStateMutation.mutate({
                              active: e.currentTarget.dataset["state"] === "unchecked" ? 1 : 0,
                              id: e.currentTarget.id,
                            });
                          }}
                          id={(row.original as Ad).id.toString()}
                          defaultChecked={cell.getValue() as boolean}
                        />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          (cell.getValue() as boolean)
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-red-500/15 text-red-500"
                        }`}>
                          {(cell.getValue() as boolean) ? (t("active") || "فعال") : (t("inactive") || "معطل")}
                        </span>
                      </div>
                    ) : cell.column.id === "image" ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border/40 cursor-pointer group">
                            <img
                              src={(cell.getValue() as string) || logo}
                              alt={(row.original as Ad).title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => { (e.target as HTMLImageElement).src = logo; }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ImageOff className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent dir={i18n.language === "en" ? "ltr" : "rtl"} className="sm:max-w-[500px]">
                          <DialogHeader>
                            <VisuallyHidden><DialogTitle></DialogTitle></VisuallyHidden>
                            <VisuallyHidden><DialogDescription></DialogDescription></VisuallyHidden>
                          </DialogHeader>
                          <img
                            src={(cell.getValue() as string) || logo}
                            alt={(row.original as Ad).title}
                            className="rounded-lg w-full"
                            onError={(e) => { (e.target as HTMLImageElement).src = logo; }}
                          />
                        </DialogContent>
                      </Dialog>
                    ) : cell.column.id === "id" ? (
                      <span className="text-xs font-mono bg-secondary/60 px-2 py-1 rounded-md">
                        {cell.getValue() as string}
                      </span>
                    ) : cell.column.id === "title" ? (
                      <span className="text-sm font-semibold text-foreground">
                        {cell.getValue() as string}
                      </span>
                    ) : cell.column.id === "description" ? (
                      <span className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                        {cell.getValue() as string}
                      </span>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <EditAdForm
                      id={(row.original as Ad).id.toString()}
                      query={query}
                      ad={row.original as Ad}
                    />
                    <DeleteAdForm
                      query={query}
                      id={(row.original as Ad).id.toString()}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-32 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageOff className="w-8 h-8 opacity-30" />
                  <span className="text-sm">{t("no_results")}</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
