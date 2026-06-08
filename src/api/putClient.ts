import axios from "axios"


export default function patchClient(data: {
  name: string,
  balance: number,
  active?: boolean
}, id: string, token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}clients/${id}`;
  return axios.patch(apiUrl, data, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY,

    }
  }).then((res) => {
    return res
  })
}