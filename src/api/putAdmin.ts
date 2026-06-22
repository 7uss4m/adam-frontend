import axios from "axios"

export default function putAdmin(token: string, id: string, data: { permissions: string[] }) {
  const apiUrl = `${import.meta.env.VITE_API_URL}admin/${id}`;
  return axios.put(apiUrl, data, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  });
}
