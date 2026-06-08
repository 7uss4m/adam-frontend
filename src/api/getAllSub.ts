import axios from "axios"

export default function getAllSub() {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories/sub`;
  return axios.get(apiUrl, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}