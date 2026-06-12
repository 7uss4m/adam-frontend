import axios from "axios";

export default function getCurrencies() {
  return axios.get(`${import.meta.env.VITE_API_URL}currencies`, {
    headers: { "x-api-key": import.meta.env.VITE_API_KEY },
  });
}
