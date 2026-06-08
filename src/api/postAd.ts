import axios from "axios"

export default function postAd(token: string, data: { title: string, description: string, active: boolean, image: File | undefined }) {

  const apiUrl = `${import.meta.env.VITE_API_URL}advers`;
  return axios.post(apiUrl, { ...data }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  }).then((res) => {
    return res
  })
}