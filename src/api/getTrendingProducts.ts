import axios from "axios";

export default function getTrendingProducts(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}products/trending`;
  return axios.get(apiUrl, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
}