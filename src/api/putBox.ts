import axios from "axios"

type data = {
  name: string
  account_name: string
  account_code: string
  description: string
  image: File | string | undefined
  currencies: { name: string }[]
  box_name: string | undefined
  wallet_address: string | undefined
  provider?: string
  gsm?: string
  account_address?: string
}
export default function putBox(token: string, id: string, data: data) {

  const apiUrl = `${import.meta.env.VITE_API_URL}boxes/${id}`;
  return axios.put(apiUrl, data, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Content-Type": "multipart/form-data"
    }
  }).then((res) => {
    return res
  })
}