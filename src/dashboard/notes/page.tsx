import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import Spinner from "../../components/Spinner";
import { Note } from "../../types/types";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import getNotes from "../../api/getNotes";
import { useTranslation } from "react-i18next";

export default function DashboardNotes() {
  // params
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const page = params.get("page") ? Number(params.get("page")) : 1;
  const filterParam = params.get("filter") ? params.get("filter") : "all";
  // state
  const [filter, setFilter] = useState(filterParam);
  // query
  const getNotesQuery = useQuery({
    queryKey: ["notes", page, filter],
    queryFn: async () => {
      const response = await getNotes(
        localStorage.getItem("token") as string,
        page.toString(),
        filter as string
      );

      const notes: Note[] =
        (response.data.result?.notes as Note[]).length > 0
          ? (response.data.result?.notes as Note[]).map((note) => {
              return {
                ...note,
                boxName: note.currencies ? note.currencies?.boxes.name : "",
                email: note?.user?.email,
                currencyName: note.currencies ? note.currencies.name : "",
                username: note?.user?.user_name || "-",
              };
            })
          : [];
      return { totalPages: response.data.result.totalPages, notes } as {
        totalPages: number;
        notes: Note[];
      };
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  // translation
  const [t, i18n] = useTranslation("global");

  // effects
  useEffect(() => {
    if (getNotesQuery.isFetched && getNotesQuery.isError) {
      console.error(getNotesQuery.error);
    }
  }, [getNotesQuery.error, getNotesQuery.isError, getNotesQuery.isFetched]);
  return (
    <section
      dir={i18n.language == "en" ? "ltr" : "rtl"}
      className="container mx-auto py-10 space-y-10"
    >
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("notes")}</p>
      </header>
      {getNotesQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getNotesQuery.isSuccess && getNotesQuery.data ? (
        <DataTable
          currentPage={page}
          totalPages={getNotesQuery.data.totalPages}
          query={getNotesQuery}
          columns={columns}
          data={getNotesQuery.data.notes}
          filter={filter as string}
          setFilter={setFilter}
        />
      ) : (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p>{t("something_went_wrong")}</p>
        </div>
      )}
    </section>
  );
}
