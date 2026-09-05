import axios from "axios"

type data = {
  name: string
  account_name: string
  account_code: string
  description: string
  image: File | undefined
  currencies: { name: string }[]
  box_name: string | undefined
  wallet_address: string | undefined
  provider?: string
  gsm?: string
  account_address?: string
}
export default function postBox(token: string, data: data) {

  const apiUrl = `${import.meta.env.VITE_API_URL}boxes`;
  return axios.post(apiUrl, data, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  }).then((res) => {
    return res
  })
}