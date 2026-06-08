import axios from "axios"


export default function postNote(token: string, data: {
  coins?: number
  currencyId: string
  image: File | undefined | null
  tx_id?: string
  code?: string
}) {


  const apiUrl = `${import.meta.env.VITE_API_URL}notes`;
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