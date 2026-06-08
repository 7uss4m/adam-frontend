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
} from "../../components/ui/dialog"
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


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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

  // toast
  const { toast } = useToast()

  // mutation
  const updateAdStateMutation = useMutation({
    mutationFn: async (data: { active: number, id: string }) => {
      const response = await putAdState(localStorage.getItem("token") as string, data.id, data.active)
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result
      })
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error
      })
      query.refetch()
    }

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
                    {cell.column.id == "active" ? (
                      <Switch
                        dir={"ltr"}
                        onClick={(e) => {
                          updateAdStateMutation.mutate({
                            active: e.currentTarget.dataset["state"] == "unchecked"
                              ? 1
                              : 0,
                            id: e.currentTarget.id
                          }
                          );
                        }}
                        id={(row.original as Ad).id.toString()}
                        defaultChecked={cell.getValue() as boolean}
                      />
                    ) : cell.column.id == "image" ? (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <img
                              src={cell.getValue() as string}
                              alt={(row.original as Ad).title}
                              className="size-[50px] rounded cursor-pointer hover:scale-[0.95] transition-all"
                            />
                          </DialogTrigger>
                          <DialogContent dir={i18n.language == "en" ? "ltr" : "rtl"} className="sm:max-w-[425px]">
                            <DialogHeader>
                              <VisuallyHidden>
                                <DialogTitle></DialogTitle>
                              </VisuallyHidden>
                              <VisuallyHidden>
                                <DialogDescription>
                                </DialogDescription>
                              </VisuallyHidden>
                            </DialogHeader>
                            <img
                              src={cell.getValue() as string}
                              alt={(row.original as Ad).title}
                              className="rounded"
                            />
                          </DialogContent>
                        </Dialog>
                        <div>
                        </div>
                      </>

                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
                <TableCell className="flex items-center justify-center gap-5">
                  <EditAdForm id={(row.original as Ad).id.toString()} query={query} ad={(row.original) as Ad} />
                  <DeleteAdForm query={query} id={(row.original as Ad).id.toString()} />
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
