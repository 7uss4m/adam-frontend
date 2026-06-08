import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import Spinner from "../../components/Spinner";
import { Level } from "../../types/types";
import getLevels from "../../api/getLevels";
import AddLevelForm from "./add-level-form";
import { useTranslation } from "react-i18next";

export default function DashboardLevels() {
  // query
  const getLevelsQuery = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const response = await getLevels();
      return response.data.result as Level[];
    },
    refetchOnWindowFocus: false
  });
  // translation
  const [t, i18n] = useTranslation("global")
  return (
    <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("levels")}</p>
      </header>
      {getLevelsQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getLevelsQuery.isSuccess && getLevelsQuery.data ? (
        <>
          <DataTable
            query={getLevelsQuery}
            columns={columns}
            data={getLevelsQuery.data}
          />
          <AddLevelForm query={getLevelsQuery} />
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p>{t("something_went_wrong")}</p>
        </div>
      )}
    </section>
  );
}
