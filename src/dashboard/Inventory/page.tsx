import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import Spinner from "../../components/Spinner";
import { Inventory } from "../../types/types";
import AddInventoryForm from "./add-inventory-form";
import getInventories from "../../api/getInventories";
import { useTranslation } from "react-i18next";


export default function DashboardInventory() {
  // query
  const getInventoriesQuery = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const response = await getInventories(localStorage.getItem("token") as string);
      return response.data.result as Inventory[];
    },
    refetchOnWindowFocus: false
  });
  // translation
  const [t, i18n] = useTranslation("global")
  return (
    <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("inventory")}</p>
      </header>
      {getInventoriesQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getInventoriesQuery.isSuccess && getInventoriesQuery.data ? (
        <>
          <DataTable
            query={getInventoriesQuery}
            columns={columns}
            data={getInventoriesQuery.data}
          />
          <AddInventoryForm query={getInventoriesQuery} />
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p>{t("something_went_wrong")}</p>
        </div>
      )}
    </section>
  );
}
