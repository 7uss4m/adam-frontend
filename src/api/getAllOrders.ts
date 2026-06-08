import axios from "axios"

export default function getAllOrders(token: string, page: number, filter: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}orders`;
  return axios.get(apiUrl, {
    params: { page, filter },
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`
    }
  }).then((res) => {
    
    return res
  })
}