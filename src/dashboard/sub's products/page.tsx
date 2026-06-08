import { useQuery } from "@tanstack/react-query";

// assets

import Spinner from "../../components/Spinner";
import { Category, Product } from "../../types/types";
import AddProductForm from "./add-product-form";
import getProducts from "../../api/getProducts";
import { useParams } from "react-router-dom";
import getAllSub from "../../api/getAllSub";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useTranslation } from "react-i18next";

export default function DashboardSubProducts() {
  // params
  const { id } = useParams();

  // query
  const getAllSubQuery = useQuery({
    queryKey: ["subs filtered"],
    queryFn: async () => {
      const response = await getAllSub();
      const sub = (response.data.result as Category[]).filter((category) => {
        if (id == category.id.toString()) {
          return category;
        }
      });
      return sub;
    },
  });
  const getSubProductsQuery = useQuery({
    queryKey: ["sub products"],
    queryFn: async () => {
      const response = await getProducts(
        id as string,
        localStorage.getItem("token") as string
      );

      return response.data.result as Product[];
    },
    refetchOnWindowFocus: false,
  });
  // translation
  const [t, i18n] = useTranslation("global");
  return (
    <>
      {getAllSubQuery.isLoading || getSubProductsQuery.isLoading ? (
        <section className="min-h-svh flex justify-center items-center">
          <Spinner />
        </section>
      ) : getAllSubQuery.isSuccess &&
        getSubProductsQuery.isSuccess &&
        getAllSubQuery.data &&
        getSubProductsQuery.data ? (
        <section
          dir={i18n.language == "en" ? "ltr" : "rtl"}
          className="container mx-auto py-10 space-y-10"
        >
          <header className="flex justify-between items-center">
            <p className="text-2xl md:text-6xl">
              {getAllSubQuery.data
                ? `${getAllSubQuery.data[0].name}'s products`
                : null}
            </p>
            {getAllSubQuery.data[0].type == "bundle" ? (
              <AddProductForm query={getSubProductsQuery} />
            ) : getSubProductsQuery.data.length > 0 ? null : (
              <AddProductForm query={getSubProductsQuery} />
            )}
          </header>
          <DataTable
            query={getSubProductsQuery}
            columns={columns}
            data={
              getAllSubQuery.data[0].type == "one"
                ? getSubProductsQuery.data.slice(0, 1)
                : getSubProductsQuery.data
            }
          />
        </section>
      ) : (
        <section className="relative min-h-svh flex justify-center items-center">
          <p className="text-2xl text-accent">
            {t("something_went_wrong")}
          </p>
        </section>
      )}
    </>
  );
}
