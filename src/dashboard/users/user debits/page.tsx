import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../../components/Spinner";
import { useParams } from "react-router-dom";
import { Order } from "../../../types/types";
import getUserDebts from "../../../api/getUserDebts";
import { useTranslation } from "react-i18next";

export default function DashboardUserDebits() {
  // params
  const { id } = useParams()

  // query
  const getUserDebitsQuery = useQuery({
    queryKey: ["user", "debits"],
    queryFn: async () => {
      const response = await getUserDebts(
        localStorage.getItem("token") as string,
        id?.toString() as string
      );
      return response.data.result as Order[]
    },
    refetchOnWindowFocus: false,
  });
  // translation
  const [t, i18n] = useTranslation("global")

  return (
    <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{`User #${id} ${t("debts")}`}</p>
      </header>
      {getUserDebitsQuery.isFetching ? (
        <div className="h-[80vh] flex justify-center items-center">
          <Spinner />
        </div>
      ) : getUserDebitsQuery.isSuccess ? (
        <DataTable
          query={getUserDebitsQuery}
          columns={columns}
          data={getUserDebitsQuery.data}
        />
      ) : (
        <p>{t("something_went_wrong")}</p>
      )}
    </section>
  );
}
