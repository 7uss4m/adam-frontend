import axios from "axios"

export default function postUserCharge(token: string, coins: number, userId: number) {

  const apiUrl = `${import.meta.env.VITE_API_URL}chargings`;
  return axios.post(apiUrl, { coins, userId }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`,
    }
  }).then((res) => {
    return res
  })
}