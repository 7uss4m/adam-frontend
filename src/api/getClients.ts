import axios from "axios"

export default function getClients(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}clients`;
  return axios.get(apiUrl, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`
    }
  }).then((res) => {
    return res
  })
}