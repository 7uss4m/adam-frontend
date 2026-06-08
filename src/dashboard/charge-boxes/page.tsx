import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import Spinner from "../../components/Spinner";
import { ChargeBox } from "../../types/types";
import getBoxes from "../../api/getBoxes";
import { AddBoxForm } from "./add-box-form";
import { useTranslation } from "react-i18next";

export default function DashboardChargeBoxes() {
  // query
  const getChargeBoxesQuery = useQuery({
    queryKey: ["boxes"],
    queryFn: async () => {
      const response = await getBoxes(localStorage.getItem("token") as string);
      return response.data.result as ChargeBox[];
    },
    refetchOnWindowFocus: false
  });

   // translation
   const [t, i18n] = useTranslation("global")
  return (
    <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("boxes")}</p>
        <AddBoxForm query={getChargeBoxesQuery} />
      </header>
      {getChargeBoxesQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getChargeBoxesQuery.isSuccess && getChargeBoxesQuery.data ? (
        <>
          <DataTable
            query={getChargeBoxesQuery}
            columns={columns}
            data={getChargeBoxesQuery.data}
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
