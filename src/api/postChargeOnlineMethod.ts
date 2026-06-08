import axios from "axios"

export default function postChargeOnlineMethod(token: string, coins:string) {

  const apiUrl = `${import.meta.env.VITE_API_URL}chargings/online`;
  return axios.post(apiUrl, { coins }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`,
    }
  }).then((res) => {
    return res
  })
}