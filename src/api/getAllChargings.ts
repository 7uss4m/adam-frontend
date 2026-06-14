import axios from "axios";

export default function getAllChargings(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}chargings`;
  return axios.get(apiUrl, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
}
