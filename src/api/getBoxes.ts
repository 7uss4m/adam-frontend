import axios from "axios"

export default function getBoxes(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}boxes`;
  return axios.get(apiUrl, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}