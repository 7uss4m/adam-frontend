import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import getAllProducts from "../../api/getAllProducts";
import Spinner from "../../components/Spinner";
import { Product } from "../../types/types";
import AddProductForm from "./add-product-form";

export default function DashboardProducts() {
  // query
  const getAllProductsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await getAllProducts(
        localStorage.getItem("token") as string
      );
      return response.data.result as Product[];
    },
    refetchOnWindowFocus: false,
  });
  return (
    <section className="container mx-auto py-10 space-y-10">
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">Products</p>
        <AddProductForm query={getAllProductsQuery} />
      </header>
      {getAllProductsQuery.isFetching ? (
        <div className="min-h-[30vh] flex justify-center items-center">
          <Spinner />
        </div>
      ) : getAllProductsQuery.isSuccess && getAllProductsQuery.data ? (
        <DataTable
          query={getAllProductsQuery}
          columns={columns}
          data={getAllProductsQuery.data}
        />
      ) : (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p>Something Wrong Happened</p>
        </div>
      )}
    </section>
  );
}
