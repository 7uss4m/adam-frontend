import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import Spinner from "../../components/Spinner";
import {  Dept } from "../../types/types";
import getAllDepts from "../../api/getAllDepts";
import { useTranslation } from "react-i18next";

export default function DashboardDepts() {
  // query
  const getDeptsQuery = useQuery({
    queryKey: ["dashboard depts"],
    queryFn: async () => {
      const response = await getAllDepts(localStorage.getItem("token") as string);
      
      return response.data.result as Dept[];
    },
    refetchOnWindowFocus: false
  });
  // translation
  const [t, i18n] = useTranslation("global")
  return (
    <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("debts")}</p>
      </header>
      {getDeptsQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getDeptsQuery.isSuccess && getDeptsQuery.data ? (
        <>
          <DataTable
            query={getDeptsQuery}
            columns={columns}
            data={getDeptsQuery.data}
          />
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p>{t("something_went_wrong")}</p>
        </div>
      )}
    </section>
  );
}
