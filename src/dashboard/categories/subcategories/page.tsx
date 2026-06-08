import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import { Category } from "../../../types/types";
import Spinner from "../../../components/Spinner";
// import { AddCategoryForm } from "./add-category-form";
import { useParams } from "react-router-dom";
import getSubCategories from "../../../api/getSubCategories";
import { AddSubForm } from "./add-sub-form";
import { useTranslation } from "react-i18next";

export default function CategorySubs() {
  // params
  const params = useParams();
  const id = params.id;
  // query
  const getSubCategoriesQuery = useQuery({
    queryKey: ["categories", "sub"],
    queryFn: async () => {
      const response = await getSubCategories(id as string);
      const subCategroies: Category[] = response.data.result;
      return subCategroies;
    },
    refetchOnWindowFocus: false

  });

  // translation
  const [, i18n] = useTranslation("global")


  return (
    <>
      {getSubCategoriesQuery.isFetching ? (
        <section className="h-screen flex justify-center items-center">
          <Spinner />
        </section>
      ) : (
        <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
          <header className="flex justify-between items-center">
            <p className="text-xl md:text-4xl">{`Category ${id}'s sub categories`}</p>
            <AddSubForm query={getSubCategoriesQuery} id={id as string} />
          </header>
          {getSubCategoriesQuery.isFetching ? (
            <div className="flex justify-center items-center h-[30vh]">
              <Spinner />
            </div>
          ) : (
            <DataTable
              query={getSubCategoriesQuery}
              columns={columns}
              data={getSubCategoriesQuery.data ? getSubCategoriesQuery.data : []}
            />
          )}
        </section>
      )}
    </>
  );
}
