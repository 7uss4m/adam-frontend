import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import getNotifications from "../../api/getNotifications";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import Spinner from "../../components/Spinner";
import { useTranslation } from "react-i18next";

export default function DashboardNotifications() {
  // query
  const getNotificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await getNotifications(
        localStorage.getItem("token") as string
      );
      // Return notifications array directly since pagination is handled by the table
      const notifications = response.data.result || [];
      return { notifications };
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // translation
  const [t, i18n] = useTranslation("global");

  useEffect(() => {
    if (getNotificationsQuery.isFetched && getNotificationsQuery.isError) {
      console.error(getNotificationsQuery.error);
    }
  }, [getNotificationsQuery.error, getNotificationsQuery.isError, getNotificationsQuery.isFetched]);

  return (
    <section
      dir={i18n.language == "en" ? "ltr" : "rtl"}
      className="container mx-auto py-10 space-y-10"
    >
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("notifications")}</p>
      </header>
      {getNotificationsQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getNotificationsQuery.isSuccess && getNotificationsQuery.data ? (
        <DataTable
          query={getNotificationsQuery}
          columns={columns}
          data={getNotificationsQuery.data.notifications}
        />
      ) : (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p>{t("something_went_wrong")}</p>
        </div>
      )}
    </section>
  );
} 