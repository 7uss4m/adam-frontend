import axios from "axios";

export type SubCategoryStats = {
  total: number;
  active: number;
  inactive: number;
  bundle: number;
  one: number;
  external: number;
  products: number;
};

export default function getSubCategoryStats(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories/sub/stats`;
  return axios
    .get<{ result: SubCategoryStats }>(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => res);
}
