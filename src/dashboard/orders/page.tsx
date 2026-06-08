import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import Spinner from "../../components/Spinner";
import { Order } from "../../types/types";
import getAllOrders from "../../api/getAllOrders";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function DashboardOrders() {
  // params
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const page = params.get("page") ? Number(params.get("page")) : 1;
  const filterParam = params.get("filter") ? params.get("filter") : "all";

  // state
  const [filter, setFilter] = useState(filterParam);

  // query
  const getAllOrdersQuery = useQuery({
    queryKey: ["orders", page, filter],
    queryFn: async () => {
      const response = await getAllOrders(
        localStorage.getItem("token") as string,
        Number(page),
        filter as string
      );
      const orders: Order[] = (response.data.result?.orders as Order[]).map(
        (order) => {
          return {
            ...order,
            subCategory: order.product?.categories.name
              ? order.product?.categories.name
              : t("deleted"),
            email: order?.user?.email,
            productName: order.product?.name,
            totalPrice: Number(order?.price?.price),
          };
        }
      );

      return { totalPages: response.data.result.totalPages, orders } as {
        totalPages: number;
        orders: Order[];
      };
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // translation
  const [t, i18n] = useTranslation("global");

  useEffect(() => {
    if (getAllOrdersQuery.isError) {
      console.error(getAllOrdersQuery.error);
    }
  }, [getAllOrdersQuery.error, getAllOrdersQuery.isError]);

  return (
    <section
      dir={i18n.language == "en" ? "ltr" : "rtl"}
      className="container mx-auto py-10 space-y-10"
    >
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("orders")}</p>
      </header>
      {getAllOrdersQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getAllOrdersQuery.isSuccess && getAllOrdersQuery.data ? (
        <DataTable
          currentPage={page}
          totalPages={getAllOrdersQuery.data.totalPages}
          query={getAllOrdersQuery}
          columns={columns}
          data={getAllOrdersQuery.data.orders}
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
