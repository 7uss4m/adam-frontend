import axios from "axios"

export default function getPaymentsMethods() {
  const apiUrl = `${import.meta.env.VITE_API_URL}payment-methods`;
  return axios.get(apiUrl, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}