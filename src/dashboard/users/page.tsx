import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import { useQuery } from "@tanstack/react-query";
import getUsers from "../../api/getUsers";
import { Level, User } from "../../types/types";
import Spinner from "../../components/Spinner";
import getLevels from "../../api/getLevels";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function DashboardUsers() {
  // params
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const page = params.get("page") ? params.get("page") : 1;
  const searchQuery = params.get("search") || "";

  // query
  const getAllUsersQuery = useQuery({
    queryKey: ["users", "all", page, searchQuery],
    queryFn: async () => {
      const response = await getUsers({
        token: localStorage.getItem("token") as string,
        page: Number(page),
        search: searchQuery,
      });
      const editedUsers = (response.data.result.users as User[]).map((user) => {
        return {
          ...user,
          balance: Number(user.balance),
          debit:
            user.debt_coins && user.debt_coins.length > 0
              ? Number(user.debt_coins[0].coins)
              : 0,
        };
      });
      return {
        totalPages: response.data.result.totalPages,
        users: editedUsers,
      } as { totalPages: number; users: User[] };
    },
    refetchOnWindowFocus: false,
  });

  const getLevelsQuery = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const response = await getLevels();
      return response.data.result as Level[];
    },
    refetchOnWindowFocus: false,
  });

  // state
  const [users, setUsers] = useState<null | User[]>(null);

  // effects
  useEffect(() => {
    if (
      getAllUsersQuery.isFetched &&
      getLevelsQuery.isFetched &&
      getAllUsersQuery.data
    ) {
      const users = getAllUsersQuery.data?.users.map((user) => {
        return {
          ...user,
          level: user.level,
        };
      });
      setUsers(users as User[]);
    }
  }, [
    getAllUsersQuery.isFetched,
    getAllUsersQuery.data?.users,
    getLevelsQuery.isFetched,
    getLevelsQuery.data,
    getAllUsersQuery.data,
  ]);

  // translation
  const [t, i18n] = useTranslation("global");
  return (
    <section
      className="container mx-auto py-10 space-y-10"
      dir={i18n.language == "en" ? "ltr" : "rtl"}
    >
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("users")}</p>
      </header>
      {getAllUsersQuery.isFetching || getLevelsQuery.isFetching ? (
        <div className="h-[80vh] flex justify-center items-center">
          <Spinner />
        </div>
      ) : getAllUsersQuery.isSuccess ? (
        <DataTable
          currentPage={Number(page)}
          totalPages={getAllUsersQuery.data.totalPages}
          levels={getLevelsQuery.data as Level[]}
          query={getAllUsersQuery}
          columns={columns}
          data={users ? users : []}
        />
      ) : (
        <p>{t("something_went_wrong")}</p>
      )}
    </section>
  );
}
