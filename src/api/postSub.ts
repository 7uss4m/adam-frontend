import axios from "axios"

export default function postSub(data: { token: string, order: number, parent_id: number, name: string, type: string, bonus: number, image?: File }) {

  const apiUrl = `${import.meta.env.VITE_API_URL}categories`;
  return axios.post(apiUrl, { name: data.name, image: data.image, parent_id: Number(data.parent_id), type: data.type, bonus: Number(data.bonus), order: data.order }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${data.token}`,
      "Content-Type": "multipart/form-data"
    }
  }).then((res) => {
    return res
  })
}