import axios from "axios"
import { Require } from "../types/types"


export default function postProduct(token: string, data: {
  image?: File | null
  name: string
  active: boolean
  category_id: number,
  price: number
  description: string,
  mainPrice: number
  requires?: Require[]
  order?: number
}) {

  const apiUrl = `${import.meta.env.VITE_API_URL}products`;
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