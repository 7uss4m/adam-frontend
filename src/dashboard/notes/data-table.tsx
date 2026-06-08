import {
  ColumnDef,
  SortingState,
  getSortedRowModel,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Note } from "../../types/types";
import { UseQueryResult } from "@tanstack/react-query";
import Pagination from "../../components/Pagination";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
// import ChangeOrderStatusForm from "./change-order-status";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "../../components/ui/dialog";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import PatchNoteForm from "./patch-note-form";
import { useTranslation } from "react-i18next";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  query: UseQueryResult;
  totalPages: number;
  currentPage: number;
  filter: string;
  setFilter: React.Dispatch<React.SetStateAction<string | null>>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalPages,
  currentPage,
  filter,
  setFilter,
  query,
}: DataTableProps<TData, TValue>) {
  // state
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  // translation
  const [t, i18n] = useTranslation("global");

  return (
    <div dir={i18n.language == "en" ? "ltr" : "rtl"}>
      <div className="flex flex-col py-4 gap-5">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className=""
          placeholder={t("search")}
        />
        <DropdownMenu dir={i18n.language == "en" ? "ltr" : "rtl"}>
          <DropdownMenuTrigger asChild>
            <Button className="w-fit" variant="outline">
              {t("status_filter")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
              <DropdownMenuRadioItem value="all">
                {t("all")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="pinding">
                {t("pending")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="reject">
                {t("rejected")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="success">
                {t("succeed")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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
                      {cell.column.id == "boxName" ? (
                        (row.original as Note).boxName ? (
                          (row.original as Note).boxName
                        ) : (
                          t("deleted")
                        )
                      ) : cell.column.id == "currencyName" ? (
                        (row.original as Note).currencyName ? (
                          (row.original as Note).currencyName
                        ) : (
                          t("deleted")
                        )
                      ) : cell.column.id == "status" ? (
                        (row.original as Note).status == "reject" ? (
                          <Badge
                            className="hover:pointer-events-none"
                            variant={"destructive"}
                          >
                            {t("rejected")}
                          </Badge>
                        ) : (row.original as Note).status == "pinding" ? (
                          <Badge
                            className="hover:pointer-events-none"
                            variant={"outline"}
                          >
                            {t("pending")}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white hover:bg-green-500 ">
                            {t("succeed")}
                          </Badge>
                        )
                      ) : (
                        // <div>
                        //   {(cell.getValue() as Price[]).map((price) => (
                        //     <div
                        //       key={price.payment_method.name}
                        //       className="flex gap-5 items-center"
                        //     >
                        //       <p className="name">{price.payment_method.name}</p>
                        //       <p className="price">{price.price} $</p>
                        //     </div>
                        //   ))}
                        // </div>
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="flex items-center justify-center gap-5">
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size={"sm"}>{t("view_image")}</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] max-h-[100%] overflow-y-auto">
                          <DialogHeader>
                            <VisuallyHidden>
                              <DialogTitle></DialogTitle>
                            </VisuallyHidden>
                            <VisuallyHidden>
                              <DialogDescription></DialogDescription>
                            </VisuallyHidden>
                          </DialogHeader>
                          <img
                            src={(row.original as Note).image as string}
                            className="rounded"
                          />
                        </DialogContent>
                      </Dialog>
                      <div></div>
                    </>
                    <PatchNoteForm
                      id={(row.original as Note).id}
                      query={query}
                      status={(row.original as Note).status}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t("no_results")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPageCount={totalPages}
        siblingCount={1}
      />
    </div>
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
