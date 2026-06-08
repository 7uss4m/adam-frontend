
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useQuery } from "@tanstack/react-query";
import getCategories from "../../api/getCategories";
import { Category } from "../../types/types";
import Spinner from "../../components/Spinner";
import { AddCategoryForm } from "./add-category-form";
import { useTranslation } from "react-i18next";

export default function DashboardCategories() {

  // query 
  const getCategoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getCategories()
      const categories: Category[] = response.data.result
      return categories
    },
    refetchOnWindowFocus: false
  })

  // translation
  const [t, i18n] = useTranslation("global")

  return (
    <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("categories")}</p>
        <AddCategoryForm />
      </header>
      {getCategoriesQuery.isFetching ? <div className="flex justify-center items-center h-[30vh]">
        <Spinner />
      </div> : <DataTable query={getCategoriesQuery} columns={columns} data={getCategoriesQuery.data ? getCategoriesQuery.data : []} />}

    </section>
  )
}