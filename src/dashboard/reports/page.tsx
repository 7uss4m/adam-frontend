import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Calendar as CalendarIcon, } from "lucide-react"
import { Page, Document, StyleSheet, Text, PDFDownloadLink, View } from "@react-pdf/renderer"
import { utils, writeFile } from "xlsx"

import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Calendar } from "../../components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover"

// assets
import Spinner from "../../components/Spinner";
import getReports from "../../api/getReports";
import { Report } from "../../types/types";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format, subDays } from "date-fns";
import { useTranslation } from "react-i18next";


const styles = StyleSheet.create({
  page: {
    padding: 10,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f3f3f3',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5,
    textAlign: 'center',
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
});


export default function DashboardReports() {
  // state
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 20),
    to: addDays(new Date(), 10),
  })
  // query
  const getReportsQuery = useQuery({
    queryKey: ["reports", date?.from, date?.to],
    queryFn: async () => {
      const response = await getReports(localStorage.getItem("token") as string, `${date?.from?.getFullYear()}-${date?.from?.getMonth()}-${date?.from?.getDate()}`, `${date?.to?.getFullYear()}-${date?.to?.getMonth()}-${date?.to?.getDate()}`);
      return response.data.result as Report[];
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // translation
  const [t, i18n] = useTranslation("global")
  return (
    <section className="container mx-auto py-10 space-y-10">
      <header dir={i18n.language == "en" ? "ltr" : "rtl"} className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("reports")}</p>
      </header>
      {getReportsQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getReportsQuery.isSuccess && getReportsQuery.data ? (
        <>
          <div className="flex flex-col justify-between sm:flex-row gap-5">
            <div >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
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
            </div>
            <div className="flex justify-center items-center gap-2">

              <Button className="p-0">

                <PDFDownloadLink style={{ display: "block", padding: "50px 20px" }} document={
                  <Document>
                    <Page style={styles.page}>
                      <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableRow}>
                          <View style={styles.tableColHeader}>
                            <Text style={styles.tableCell}>Category ID</Text>
                          </View>
                          <View style={styles.tableColHeader}>
                            <Text style={styles.tableCell}>Category Name</Text>
                          </View>
                          <View style={styles.tableColHeader}>
                            <Text style={styles.tableCell}>Total Price</Text>
                          </View>
                          <View style={styles.tableColHeader}>
                            <Text style={styles.tableCell}>Total Quantity</Text>
                          </View>
                        </View>
                        {/* Table Data */}
                        {getReportsQuery.data.map((report, index) => (
                          <View style={styles.tableRow} key={index}>
                            <View style={styles.tableCol}>
                              <Text style={styles.tableCell}>{report.categoryId}</Text>
                            </View>
                            <View style={styles.tableCol}>
                              <Text style={styles.tableCell}>{report.categoryName}</Text>
                            </View>
                            <View style={styles.tableCol}>
                              <Text style={styles.tableCell}>{report.totalPrice}</Text>
                            </View>
                            <View style={styles.tableCol}>
                              <Text style={styles.tableCell}>{report.totalQuantity}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </Page>
                  </Document>
                } fileName="data">
                  {({ loading }) => (loading ? "Loading..." : "Pdf")}
                </PDFDownloadLink>
              </Button>

              <Button onClick={() => {
                const worksheet = utils.json_to_sheet(getReportsQuery.data);

                // Create a new workbook
                const workbook = utils.book_new();

                // Add the worksheet to the workbook
                utils.book_append_sheet(workbook, worksheet, "Reports");

                // Write the workbook to a file
                writeFile(workbook, 'Categories.xlsx');
              }}>Excel</Button>
            </div>


          </div>
          <DataTable
            query={getReportsQuery}
            columns={columns}
            data={getReportsQuery.data}
          />
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p>Something Wrong Happened</p>
        </div>
      )
      }
    </section >
  );
}



