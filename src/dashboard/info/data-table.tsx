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
import { UseQueryResult } from "@tanstack/react-query";

import { useTranslation } from "react-i18next";
import { Info } from "../../types/types";
import EditInfoForm from "./edit-info-form";
import EditMoonForm from "./edit-moon-form";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getEmailQuery: UseQueryResult;
  getPhoneQuery: UseQueryResult;
  getPrivacyQuery: UseQueryResult;
  getAboutUsQuery: UseQueryResult;
  getWhatsappQuery: UseQueryResult;
  getFacebookQuery: UseQueryResult;
  getTelegramQuery: UseQueryResult;
  getPayMoonQuery: UseQueryResult;
  getDollarQuery: UseQueryResult;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  getEmailQuery,
  getPhoneQuery,
  getPrivacyQuery,
  getAboutUsQuery,
  getWhatsappQuery,
  getFacebookQuery,
  getTelegramQuery,
  getPayMoonQuery,
  getDollarQuery,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
                    {cell.column.id == "dollar_exchange" ? (
                      <div className="flex flex-col justify-center items-center gap-2">
                        <span>{(row.original as Info).dollar_exchange}</span>
                        <EditInfoForm
                          data={(getDollarQuery.data as { dollar_exchange: string }).dollar_exchange}
                          info="dollar_exchange"
                          query={getDollarQuery}
                        />
                      </div>
                    ) : cell.column.id == "code" ? (
                      <div className="flex flex-col justify-center items-center gap-2">
                        <span>{(row.original as Info).code}</span>
                        <EditMoonForm
                          data={(getPayMoonQuery.data as { date: string }).date}
                          query={getPayMoonQuery}
                        />
                      </div>
                    ) : cell.column.id == "email" ? (
                      <div className="flex flex-col justify-center items-center gap-2">
                        <span>{(row.original as Info).email}</span>
                        <EditInfoForm
                          data={(getEmailQuery.data as { email: string }).email}
                          info="email"
                          query={getEmailQuery}
                        />
                      </div>
                    ) : cell.column.id == "phone" ? (
                      <div className="flex flex-col justify-center items-center gap-2">
                        <span>{(row.original as Info).phone}</span>
                        <EditInfoForm
                          data={(getPhoneQuery.data as { phone: string }).phone}
                          info="phone"
                          query={getPhoneQuery}
                        />
                      </div>
                    ) : cell.column.id == "privacy" ? (
                      <div className="flex flex-col justify-center items-center gap-2">
                        <span>{(row.original as Info).privacy}</span>
                        <EditInfoForm
                          data={
                            (getPrivacyQuery.data as { privacy: string })
                              .privacy
                          }
                          info="privacy"
                          query={getPrivacyQuery}
                        />
                      </div>
                    ) : cell.column.id == "aboutus" ? (
                      <div className="flex flex-col justify-center items-center gap-2">
                        <span>{(row.original as Info).aboutus}</span>
                        <EditInfoForm
                          data={
                            (getAboutUsQuery.data as { aboutus: string })
                              .aboutus
                          }
                          info="aboutus"
                          query={getAboutUsQuery}
                        />
                      </div>
                    ) : cell.column.id == "whatsup" ? (
                      <div className="flex flex-col justify-center items-center gap-2">
                        <span>{(row.original as Info).whatsup}</span>
                        <EditInfoForm
                          data={
                            (getWhatsappQuery.data as { whatsup: string })
                              .whatsup
                          }
                          info="whatsup"
                          query={getWhatsappQuery}
                        />
                      </div>
                    ) : cell.column.id == "telegram" ? (
                      <div className="flex flex-col justify-center items-center gap-2">
                        <span>{(row.original as Info).telegram}</span>
                        <EditInfoForm
                          data={
                            (getTelegramQuery.data as { telegram: string })
                              .telegram
                          }
                          info="telegram"
                          query={getTelegramQuery}
                        />
                      </div>
                    ) : cell.column.id == "facebook" ? (
                      <div className="flex flex-col justify-center items-center gap-2">
                        <span>{(row.original as Info).facebook}</span>
                        <EditInfoForm
                          data={
                            (getFacebookQuery.data as { facebook: string })
                              .facebook
                          }
                          info="facebook"
                          query={getFacebookQuery}
                        />
                      </div>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
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
