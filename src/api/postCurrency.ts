import axios from "axios";

export default function postCurrency(token: string, name: string) {
  return axios.post(
    `${import.meta.env.VITE_API_URL}currencies`,
    { name },
    {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
