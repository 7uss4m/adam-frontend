import axios from "axios"

export default function getProducts(id: string, token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}products/by/${id}`;
  return axios.get(apiUrl, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": token ? `Bearer ${token}` : null
    }
  }).then((res) => {

    return res
  })
}