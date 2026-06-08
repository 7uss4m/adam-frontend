import axios from "axios"

export default function deleteProduct(token: string, id: string) {

  const apiUrl = `${import.meta.env.VITE_API_URL}products/${id}`;
  return axios.delete(apiUrl, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}