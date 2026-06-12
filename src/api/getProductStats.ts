import axios from "axios";

export type ProductStats = {
  total: number;
  active: number;
  inactive: number;
  withOffers: number;
  sources: string[];
};

export default function getProductStats(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}products/stats`;
  return axios
    .get<{ result: ProductStats }>(apiUrl, {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res);
}
