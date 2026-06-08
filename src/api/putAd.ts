import axios from "axios"


export default function putAd(token: string, id: string, data: {
  title: string;
  description: string;
  image?: string | undefined|File;
  active: boolean;
}) {

  const apiUrl = `${import.meta.env.VITE_API_URL}advers/${id}`;
  return axios.put(apiUrl, { ...data }, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Content-Type": "multipart/form-data"

    }
  }).then((res) => {
    return res
  })
}