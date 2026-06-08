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
} from "../../../components/ui/table";
import { Order } from "../../../types/types";
import { UseQueryResult } from "@tanstack/react-query";
import ChangeDebitStatusForm from "./change-user-debit-status";
import { useTranslation } from "react-i18next";
// import Pagination from "../../../components/Pagination";
// import { useEffect, useState } from "react";
// import { Input } from "../../../components/ui/input";

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
  // const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    // state: {
    //   globalFilter,
    // },
    // onGlobalFilterChange: setGlobalFilter,
  });
  // translation
  const [t, i18n] = useTranslation("global")
  return (
    <div dir={i18n.language == "en" ? "ltr" : "rtl"}>
      {/* <div className="flex items-center py-4">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className=""
          placeholder="Search all columns..."
        />
      </div> */}
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
                      {cell.column.id == "active"
                        ? null
                        : cell.column.id == "product"
                          ? (row.original as Order).price.product?.name
                            ? (row.original as Order).price.product?.name
                            : t("deleted")
                          : cell.column.id == "totalPrice"
                            ? `${(row.original as Order)?.price?.price} USD`
                            : // <div>
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
                            cell.column.id == "date"
                              ? (row.original as Order).created_at.slice(0, 10)
                              : flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                    </TableCell>
                  ))}
                  <TableCell className="flex items-center justify-center gap-5">
                    <ChangeDebitStatusForm
                      status={(row.original as Order).status}
                      orderId={(row.original as Order).id}
                      query={query}
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
    </div>
  );
}

// A typical debounced input react component
// function DebouncedInput({
//   value: initialValue,
//   onChange,
//   debounce = 500,
//   ...props
// }: {
//   value: string | number;
//   onChange: (value: string | number) => void;
//   debounce?: number;
// } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
//   const [value, setValue] = useState(initialValue);

//   useEffect(() => {
//     setValue(initialValue);
//   }, [initialValue]);

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       onChange(value);
//     }, debounce);

//     return () => clearTimeout(timeout);
//   }, [value]);

//   return (
//     <Input
//       {...props}
//       value={value}
//       onChange={(e) => setValue(e.target.value)}
//     />
//   );
// }
