import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import Spinner from "../../components/Spinner";
import { Charge } from "../../types/types";
import getAllChargings from "../../api/getAllChargings";
import { useTranslation } from "react-i18next";

export default function DashboardCharges() {
  // query
  const getChargesQuery = useQuery({
    queryKey: ["charges"],
    queryFn: async () => {
      const response = await getAllChargings(localStorage.getItem("token") as string);
      return response.data.result as Charge[];
    },
    refetchOnWindowFocus: false
  });
  // translation
  const [t, i18n] = useTranslation("global")
  return (
    <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("charges")}</p>
      </header>
      {getChargesQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getChargesQuery.isSuccess && getChargesQuery.data ? (
        <>
          <DataTable
            query={getChargesQuery}
            columns={columns}
            data={getChargesQuery.data}
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
