import axios from "axios"

export default function putAdState(token: string, id: string, state: number) {

  const apiUrl = `${import.meta.env.VITE_API_URL}advers/status/${id}/?active=${state}`;
  return axios.put(apiUrl, null, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY

    }
  }).then((res) => {
    return res
  })
}