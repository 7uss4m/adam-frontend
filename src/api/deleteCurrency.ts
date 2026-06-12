import axios from "axios";

export default function deleteCurrency(token: string, id: string) {
  return axios.delete(`${import.meta.env.VITE_API_URL}currencies/${id}`, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
}
