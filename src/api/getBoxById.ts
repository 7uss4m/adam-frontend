import axios from "axios"

export default function getBoxById(token: string, id: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}boxes/${id}`;
  return axios.get(apiUrl, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}