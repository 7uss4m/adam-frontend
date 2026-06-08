import axios from "axios"

export default function postAddBalance(token: string, coins: string, methodId: string) {

  const apiUrl = `${import.meta.env.VITE_API_URL}chargings/online`;
  return axios.post(apiUrl, { coins, methodId }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`,
    }
  }).then((res) => {
    return res
  })
}