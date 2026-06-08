import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../../components/Spinner";
import { useLocation, useParams } from "react-router-dom";
import getUserOrders from "../../../api/getUserOrders";
import { Order } from "../../../types/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function DashboardUserOrders() {

  const { id } = useParams()

  // params
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const filterParam = params.get("filter") ? params.get("filter") : "all";

  // state
  const [filter, setFilter] = useState(filterParam)

  // query
  const getUserOrdersQuery = useQuery({
    queryKey: ["user", "orders", filter],
    queryFn: async () => {
      const response = await getUserOrders(
        localStorage.getItem("token") as string,
        id as string,
        filter as string
      );
      const orders: Order[] = (response.data.result as Order[]).map((order) => {
        return { ...order, subCategory: order.price.product?.categories.name, email: order?.user?.email, productName: order.price?.product?.name, totalPrice: Number(order?.price?.price) }
      })
      return orders as Order[]
    },
    refetchOnWindowFocus: false,
    retry: false
  });

  // translation
  const [t, i18n] = useTranslation("global")

 

  return (
    <section dir={i18n.language == "en" ? "ltr" : "rtl"} className="container mx-auto py-10 space-y-10">
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{`${t("user")} #${id} ${t("orders")}`}</p>

      </header>
      {getUserOrdersQuery.isFetching ? (
        <div className="h-[80vh] flex justify-center items-center">
          <Spinner />
        </div>
      ) : getUserOrdersQuery.isSuccess ? (
        <DataTable
          filter={filter as string}
          setFilter={setFilter}
          query={getUserOrdersQuery}
          columns={columns}
          data={getUserOrdersQuery.data}
        />
      ) : (
        <p>{t("something_went_wrong")}</p>
      )}
    </section>
  );
}
