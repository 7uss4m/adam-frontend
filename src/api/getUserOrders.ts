import axios from "axios"

export default function getUserOrders(token: string, id: string, filter: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}orders/user/${id}`;
  return axios.get(apiUrl, {
    params: { filter },
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}