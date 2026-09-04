import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import getMainCategories from "../../api/getMainCategories";
import type { MainCategory } from "../../types/types";
import { AddMainCategoryForm } from "./add-main-category-form";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";

export default function DashboardMainCategories() {
  const [t] = useTranslation("global");

  const mainCategoriesQuery = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const res = await getMainCategories({
        token: localStorage.getItem("token") as string,
      });
      return (res.data?.result ?? []) as MainCategory[];
    },
  });

  const mainCategories = mainCategoriesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">
          {t("main_categories")}
        </h1>
        <AddMainCategoryForm />
      </div>

      <DataTable
        columns={createColumns(t, mainCategoriesQuery)}
        data={mainCategories}
      />
    </div>
  );
}
