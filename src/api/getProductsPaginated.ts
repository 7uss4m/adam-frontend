import axios from "axios";
import { Product } from "../types/types";

export type ProductsPaginatedParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: "all" | "active" | "inactive";
  offer?: "all" | "offer" | "no_offer";
  source?: string;
  sort?: string;
};

export type ProductsPaginatedResponse = {
  result: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function getProductsPaginated(
  token: string,
  params: ProductsPaginatedParams
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}products`;
  return axios
    .get<ProductsPaginatedResponse>(apiUrl, {
      params,
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res);
}
