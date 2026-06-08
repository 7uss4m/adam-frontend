import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import { useQuery } from "@tanstack/react-query";
import { User } from "../../types/types";
import Spinner from "../../components/Spinner";

import getAdmins from "../../api/getAdmins";
import { AddAdminForm } from "./add-admin-form";
import { useTranslation } from "react-i18next";

export default function DashboardAdmins() {

  // query
  const getAdminsQuery = useQuery({
    queryKey: ["get", "admins"],
    queryFn: async () => {
      const response = await getAdmins(
        localStorage.getItem("token") as string,
      );
      return response.data.result as User[]

    },
    refetchOnWindowFocus: false,
  });

  // translations
  const [t, i18n] = useTranslation("global")

  return (
    <section className="container mx-auto py-10 space-y-10" dir={i18n.language == "en" ? "ltr" : "rtl"}>
      <header className="flex justify-between items-center" >
        <p className="text-2xl md:text-6xl">{t("admins")}</p>
        <AddAdminForm query={getAdminsQuery} />
      </header>
      {getAdminsQuery.isFetching ? (
        <div className="h-[80vh] flex justify-center items-center">
          <Spinner />
        </div>
      ) : getAdminsQuery.isSuccess ? (
        <DataTable
          query={getAdminsQuery}
          columns={columns}
          data={getAdminsQuery.data}
        />
      ) : (
        <p>{t("something_wrong_happened")}</p>
      )}
    </section>
  );
}
