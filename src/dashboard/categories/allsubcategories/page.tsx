import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import { Category } from "../../../types/types";
import Spinner from "../../../components/Spinner";
import getAllSub from "../../../api/getAllSub";
import { useTranslation } from "react-i18next";
import { AddSubForm } from "./add-sub-form";

export default function DashboardAllSub() {
  // query
  const getSubCategoriesQuery = useQuery({
    queryKey: ["sub"],
    queryFn: async () => {
      const response = await getAllSub();
      const subCategroies: Category[] = response.data.result;
      return subCategroies;
    },
    refetchOnWindowFocus: false
  });
  // translation
  const [t, i18n] = useTranslation("global")
  return (
    <>
      {getSubCategoriesQuery.isFetching ? (
        <section className="h-screen flex justify-center items-center">
          <Spinner />
        </section>
      ) : (
        <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
          <header className="flex justify-between items-center">
            <p className="text-2xl md:text-6xl">{t("sub_categories")}</p>
            <AddSubForm query={getSubCategoriesQuery} />
          </header>
          {getSubCategoriesQuery.isFetching ? (
            <div className="min-h-[30vh] flex justify-center items-center">
              <Spinner />
            </div>
          ) : getSubCategoriesQuery.isSuccess && getSubCategoriesQuery.data ? (
            <DataTable
              columns={columns}
              data={
                getSubCategoriesQuery.data ? getSubCategoriesQuery.data : []
              }
              query={getSubCategoriesQuery}
            />
          ) : (
            <div className="min-h-[30vh] flex justify-center items-center">
              <p>{t("something_went_wrong")}</p>
            </div>
          )}
        </section>
      )}
    </>
  );
}
