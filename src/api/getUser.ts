import axios from "axios"

export default function getUser(token: string, sy?: boolean) {
  const apiUrl = new URL(`${import.meta.env.VITE_API_URL}users`);
  if (sy) {
    apiUrl.searchParams.append("sy", String(sy))
  }
  return axios.get(apiUrl.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}