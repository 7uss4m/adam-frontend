import axios from "axios"


export default function putCategory(token: string, id: string, order: number, name?: string, image?: File) {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories/${id}`;
  return axios.put(apiUrl, { name, order, image }, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Content-Type": "multipart/form-data"
    }
  }).then((res) => {
    return res
  })
}