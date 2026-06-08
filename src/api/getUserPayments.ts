import axios from "axios"

export default function getUserPayments(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}orders/user`;
  return axios.get(apiUrl, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}