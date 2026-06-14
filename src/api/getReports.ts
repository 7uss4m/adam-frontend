import axios from "axios";

export default function getReports(token: string, start: string, end: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories/aggregates`;
  return axios.get(apiUrl, {
    params: { start, end },
    timeout: 60_000,
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
}
