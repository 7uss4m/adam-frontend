import {
  ColumnFiltersState,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  getPaginationRowModel,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import ChargeUserForm from "./charge-user-form";
import { Level, User } from "../../types/types";
import { UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
// import { IoDiamond } from "react-icons/io5";
import ChangeUserProgress from "./change-user-progress";
import Pagination from "../../components/Pagination";
import ChangeUserDebit from "./change-debit-form";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import DeleteUserForm from "./delete-user-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

// level colors
// const COLORS = {
//   bronze: "#CD7F32",
//   silver: "#c0c0c0",
//   gold: "#FFD700",
//   platinum: "#9206f8",
//   diamond: "#B9F2FF",
// };

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  query: UseQueryResult;
  levels: Level[];
  totalPages: number;
  currentPage: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  query,

  totalPages,
  currentPage,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "auto",
    state: {
      columnFilters,
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  // translation
  const [t, i18n] = useTranslation("global");

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(initialSearch);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      if (inputValue) {
        params.set("search", inputValue);
        params.set("page", "1");
      } else {
        params.delete("search");
      }
      navigate(
        { pathname: location.pathname, search: params.toString() },
        { replace: true }
      );
    }, 500);

    return () => clearTimeout(timeout);
  }, [inputValue]);

  return (
    <div dir={i18n.language == "en" ? "ltr" : "rtl"}>
      <div className="flex items-center py-4">
        <Input
          placeholder={t("filter_emails")}
          defaultValue={
            new URLSearchParams(location.search).get("search") || ""
          }
          onChange={(e) => setInputValue(e.target.value)}
          className="max-w-sm"
        />
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
                      {cell.column.id == "level" ? (
                        <div className="flex flex-col justify-center ">
                          {/* <span
                            style={{
                              color: `${
                                COLORS[
                                  getUserLevel(
                                    levels,
                                    (row.original as User).progress
                                  )?.name as keyof typeof COLORS
                                ]
                              }`,
                            }}
                          >
                            <IoDiamond
                              className={`size-[20px]`}
                              style={{
                                color: getUserLevel(
                                  levels,
                                  (row.original as User).progress
                                )?.name as keyof typeof COLORS,
                              }}
                            />
                          </span> */}
                          <span>{(row.original as User)?.level?.name}</span>
                        </div>
                      ) : cell.column.id == "balance" ? (
                        `${cell.getValue()}$`
                      ) : cell.column.id == "debit" ? (
                        (row.original as User).debit == 0 ? (
                          t("not_allowed")
                        ) : (
                          (row.original as User).debit
                        )
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="flex gap-5 items-center">
                    <Link to={`${(row.original as User).id}/orders`}>
                      <Button>{t("orders")}</Button>
                    </Link>
                    <Link to={`${(row.original as User).id}/debits`}>
                      <Button>{t("debts")}</Button>
                    </Link>
                    <ChargeUserForm
                      query={query}
                      userId={Number((row.original as User).id)}
                    />
                    <ChangeUserProgress
                      user={row.original as User}
                      query={query}
                      userId={Number((row.original as User).id)}
                    />
                    <ChangeUserDebit
                      query={query}
                      userId={Number((row.original as User).id)}
                    />
                    <DeleteUserForm
                      query={query}
                      userId={(row.original as User).id.toString()}
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
        siblingCount={1}
        currentPage={currentPage}
        totalPageCount={totalPages}
      />
    </div>
  );
}
