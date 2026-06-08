import axios from "axios"


export default function putSubCategory(data: { token: string, id: string, type: string, bonus: number, name?: string, image?: File, order: number, parent_id?: number }) {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories/${data.id}`;
  return axios.put(apiUrl, { name: data.name, image: data.image, type: data.type, bonus: data.bonus, order: data.order, parent_id: data.parent_id }, {
    headers: {
      "Authorization": `Bearer ${data.token}`,
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Content-Type": "multipart/form-data"
    }
  }).then((res) => {
    return res
  })
}