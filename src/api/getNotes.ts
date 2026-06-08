import axios from "axios"

export default function getNotes(token: string, page: string, filter: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}notes`;
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