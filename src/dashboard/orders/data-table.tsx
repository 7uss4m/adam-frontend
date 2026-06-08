import {
  ColumnDef,
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
import { Order } from "../../types/types";
import { UseQueryResult } from "@tanstack/react-query";
import Pagination from "../../components/Pagination";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import ChangeOrderStatusForm from "./change-order-status";
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
  query,
  filter,
  setFilter,
}: DataTableProps<TData, TValue>) {
  // state
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    state: {
      globalFilter,
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
                      {cell.column.id == "pay_done" ? (
                        (row.original as Order).pay_done == false ? (
                          <Badge className="text-center bg-red-500 hover:bg-red-500 text-white">
                            {t("not_payed")}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white hover:bg-green-500 ">
                            {t("payed")}
                          </Badge>
                        )
                      ) : cell.column.id == "active" ? null : cell.column.id ==
                        "status" ? (
                        (row.original as Order).status == "pending" ||
                        (row.original as Order).status == "pinding" ||
                        (row.original as Order).status == "wait" ? (
                          <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white">
                            {t("pending")}
                          </Badge>
                        ) : (row.original as Order).status == "reject" ? (
                          <Badge
                            className="hover:pointer-events-none"
                            variant={"destructive"}
                          >
                            {t("rejected")}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white hover:bg-green-500 ">
                            {t("succeed")}
                          </Badge>
                        )
                      ) : cell.column.id == "email" ? (
                        (row.original as Order).user?.email ? (
                          (row.original as Order).user?.email
                        ) : (
                          t("deleted")
                        )
                      ) : cell.column.id == "product" ? (
                        (row.original as Order).price.product?.name
                      ) : cell.column.id == "totalPrice" ? (
                        (row.original as Order)?.product?.price ? (
                          `${Number(
                            (row.original as Order)?.product?.price
                          ).toFixed(2)} USD`
                        ) : (
                          t("deleted")
                        )
                      ) : cell.column.id == "total" ? (
                        `${Number((row.original as Order).total).toFixed(
                          2
                        )} USD`
                      ) : cell.column.id == "productName" ? (
                        (row.original as Order).productName ? (
                          (row.original as Order).productName
                        ) : (
                          t("deleted")
                        )
                      ) : cell.column.id == "subCategory" ? (
                        (row.original as Order).subCategory ? (
                          (row.original as Order).subCategory
                        ) : (
                          t("deleted")
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
                    <ChangeOrderStatusForm
                      query={query}
                      orderId={(row.original as Order).id as string}
                      status={(row.original as Order).status as string}
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
