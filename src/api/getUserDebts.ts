import axios from "axios"

export default function getUserDebts(token: string, id: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}orders/user/${id}`;
  return axios.get(apiUrl, {
    params: { isDept: "true" },
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}