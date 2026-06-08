import axios from "axios"

export default function getClientInfo(token: string, apiKey: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}client/info`;
  return axios.get(apiUrl, {
    headers: {
      "x-api-key": apiKey,
      "Authorization": `Bearer ${token}`
    }
  }).then((res) => {
    return res
  })
}