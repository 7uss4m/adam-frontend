import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets

import Spinner from "../../components/Spinner";
import { Ad } from "../../types/types";
import AddAdForm from "./add-ad-form";
import getAds from "../../api/getAds";
import { useTranslation } from "react-i18next";

export default function DashboardAds() {
  // query
  const getAllAdsQuery = useQuery({
    queryKey: ["ads"],
    queryFn: async () => {
      const response = await getAds();
      return response.data.result as Ad[];
    },
    refetchOnWindowFocus: false
  });
  // translation
  const [t, i18n] = useTranslation("global")
  return (
    <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("ads")}</p>
        <AddAdForm query={getAllAdsQuery} />
      </header>
      {getAllAdsQuery.isFetching ? (
        <div className="min-h-[30vh] flex justify-center items-center">
          <Spinner />
        </div>
      ) : getAllAdsQuery.isSuccess && getAllAdsQuery.data ? (
        <DataTable
          query={getAllAdsQuery}
          columns={columns}
          data={getAllAdsQuery.data}
        />
      ) : (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p>{t("something_went_wrong")}</p>
        </div>
      )}
    </section>
  );
}
