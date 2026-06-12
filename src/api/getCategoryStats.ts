import axios from "axios";

export type CategoryStats = {
  total: number;
  active: number;
  inactive: number;
  subcategories: number;
  external: number;
  products: number;
};

export default function getCategoryStats(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories/stats`;
  return axios
    .get<{ result: CategoryStats }>(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => res);
}
