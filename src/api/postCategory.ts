import axios from "axios"

export default function postCategory(token: string, name: string, order: number, image?: File) {

  const apiUrl = `${import.meta.env.VITE_API_URL}categories`;
  return axios.post(apiUrl, { name, order, image }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  }).then((res) => {
    return res
  })
}