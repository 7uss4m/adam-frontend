import axios from "axios"

export default function postRegenerate(data: { name: string, balance: number, active: boolean }, id: string, token: string) {

  const apiUrl = `${import.meta.env.VITE_API_URL}/clients/${id}/regenerate-key`;
  return axios.post(apiUrl, { ...data }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`
    }
  }).then((res) => {
    return res
  })
}