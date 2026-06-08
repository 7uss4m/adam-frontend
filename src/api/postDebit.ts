import axios from "axios"

export default function postDebit(token: string, coins: number, userId: number, expire_limit: number) {

  const apiUrl = `${import.meta.env.VITE_API_URL}depts`;
  return axios.post(apiUrl, { coins, userId, expire_limit }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`,
    }
  }).then((res) => {
    return res
  })
}