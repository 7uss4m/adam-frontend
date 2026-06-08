import axios from "axios"


export default function patchClientIp(data: {
  allowed_ips: string
}, token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}clients`;
  return axios.patch(apiUrl, data, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY,

    }
  }).then((res) => {
    return res
  })
}