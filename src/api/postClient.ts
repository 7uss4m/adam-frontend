import axios from "axios"

export default function postClient(token: string, data: {
  name: string,
  balance: number,
  userId: string

}) {

  const apiUrl = `${import.meta.env.VITE_API_URL}clients`;
  return axios.post(apiUrl, data, {

    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}