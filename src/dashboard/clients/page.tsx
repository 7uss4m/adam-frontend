import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import Spinner from "../../components/Spinner";
import { Client } from "../../types/types";
import { useTranslation } from "react-i18next";
import getClients from "../../api/getClients";
import { AddClientForm } from "./add-client-form";

export default function DashboardClients() {
  // query
  const getClientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await getClients(
        localStorage.getItem("token") as string
      );
      return response.data.clients as Client[];
    },
    refetchOnWindowFocus: false,
  });
  // translation
  const [t, i18n] = useTranslation("global");
  return (
    <section
      dir={i18n.language == "en" ? "ltr" : "rtl"}
      className="container mx-auto py-10 space-y-10"
    >
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("admins")}</p>
        <AddClientForm query={getClientsQuery} />
      </header>
      {getClientsQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getClientsQuery.isSuccess && getClientsQuery.data ? (
        <>
          <DataTable
            query={getClientsQuery}
            columns={columns}
            data={getClientsQuery.data}
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
