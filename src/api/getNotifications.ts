import axios from "axios"

export default function getNotifications(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}notifications`;
  return axios.get(apiUrl, {
    
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`
    }
  }).then((res) => {
    return res
  })
}