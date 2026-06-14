import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar as CalendarIcon,
  Download,
  FileSpreadsheet,
  Package,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  Page,
  Document,
  StyleSheet,
  Text,
  PDFDownloadLink,
  View,
} from "@react-pdf/renderer";
import { utils, writeFile } from "xlsx";

import Spinner from "../../components/Spinner";
import getReports from "../../api/getReports";
import { Report } from "../../types/types";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";

const pdfStyles = StyleSheet.create({
  page: { padding: 24 },
  title: { fontSize: 16, marginBottom: 12, fontWeight: "bold" },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableRow: { flexDirection: "row" },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#f3f3f3",
    padding: 6,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 6,
    textAlign: "center",
  },
  tableCell: { fontSize: 10 },
});

function formatDateParam(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-foreground">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardReports() {
  const [t, i18n] = useTranslation("global");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const reportsQuery = useQuery({
    queryKey: ["reports", date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () => {
      if (!date?.from || !date?.to) return [] as Report[];
      const token = localStorage.getItem("token") as string;
      const response = await getReports(
        token,
        formatDateParam(date.from),
        formatDateParam(date.to)
      );
      return response.data.result as Report[];
    },
    enabled: Boolean(date?.from && date?.to),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const columns = useMemo(() => createColumns(t), [t]);

  const reports = reportsQuery.data ?? [];

  const totals = useMemo(() => {
    let quantity = 0;
    let price = 0;
    for (const row of reports) {
      quantity += Number(row.totalQuantity) || 0;
      price += Number(row.totalPrice) || 0;
    }
    return { quantity, price: price.toFixed(2) };
  }, [reports]);

  const exportExcel = () => {
    const rows = reports.map((r) => ({
      [t("reports_category_id")]: r.categoryId,
      [t("reports_category_name")]: r.categoryName,
      [t("reports_total_quantity")]: r.totalQuantity,
      [t("reports_total_price")]: r.totalPrice,
    }));
    const worksheet = utils.json_to_sheet(rows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Reports");
    writeFile(workbook, `reports-${formatDateParam(date!.from!)}-${formatDateParam(date!.to!)}.xlsx`);
  };

  if (reportsQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (reportsQuery.isError) {
    return (
      <div
        dir={i18n.language === "en" ? "ltr" : "rtl"}
        className="flex min-h-[40vh] flex-col items-center justify-center gap-4"
      >
        <p className="text-muted-foreground">{t("something_went_wrong")}</p>
        <Button variant="outline" onClick={() => reportsQuery.refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("refresh")}
        </Button>
      </div>
    );
  }

  return (
    <div
      dir={i18n.language === "en" ? "ltr" : "rtl"}
      className="space-y-8 pb-10"
    >
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-orbitron text-xl font-bold text-foreground sm:text-2xl">
              {t("reports")}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t("reports_page_subtitle")}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => reportsQuery.refetch()}
          disabled={reportsQuery.isFetching}
          aria-label={t("refresh")}
        >
          <RefreshCw className={cn("h-4 w-4", reportsQuery.isFetching && "animate-spin")} />
        </Button>
      </motion.header>

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <StatCard
          label={t("reports_total_quantity")}
          value={totals.quantity}
          icon={<ShoppingCart className="h-5 w-5" />}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          label={t("reports_total_price")}
          value={totals.price}
          icon={<Package className="h-5 w-5" />}
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-full justify-start text-start font-normal sm:w-[320px]",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="me-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} – {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>{t("reports_pick_date")}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <PDFDownloadLink
              document={
                <Document>
                  <Page style={pdfStyles.page}>
                    <Text style={pdfStyles.title}>{t("reports")}</Text>
                    <View style={pdfStyles.table}>
                      <View style={pdfStyles.tableRow}>
                        <View style={pdfStyles.tableColHeader}>
                          <Text style={pdfStyles.tableCell}>{t("reports_category_id")}</Text>
                        </View>
                        <View style={pdfStyles.tableColHeader}>
                          <Text style={pdfStyles.tableCell}>{t("reports_category_name")}</Text>
                        </View>
                        <View style={pdfStyles.tableColHeader}>
                          <Text style={pdfStyles.tableCell}>{t("reports_total_price")}</Text>
                        </View>
                        <View style={pdfStyles.tableColHeader}>
                          <Text style={pdfStyles.tableCell}>{t("reports_total_quantity")}</Text>
                        </View>
                      </View>
                      {reports.map((report, index) => (
                        <View style={pdfStyles.tableRow} key={index}>
                          <View style={pdfStyles.tableCol}>
                            <Text style={pdfStyles.tableCell}>{report.categoryId}</Text>
                          </View>
                          <View style={pdfStyles.tableCol}>
                            <Text style={pdfStyles.tableCell}>{report.categoryName}</Text>
                          </View>
                          <View style={pdfStyles.tableCol}>
                            <Text style={pdfStyles.tableCell}>{report.totalPrice}</Text>
                          </View>
                          <View style={pdfStyles.tableCol}>
                            <Text style={pdfStyles.tableCell}>{String(report.totalQuantity)}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </Page>
                </Document>
              }
              fileName={`reports-${formatDateParam(date!.from!)}.pdf`}
            >
              {({ loading }) => (
                <>
                  <Download className="h-4 w-4" />
                  {loading ? "..." : "PDF"}
                </>
              )}
            </PDFDownloadLink>
          </Button>

          <Button variant="outline" className="gap-2" onClick={exportExcel} disabled={!reports.length}>
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={reports} />
    </div>
  );
}
