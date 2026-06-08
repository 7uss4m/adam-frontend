import axios from "axios"


export default function patchNote(token: string, id: string, status: string) {

  const apiUrl = `${import.meta.env.VITE_API_URL}notes/status/${id}`;
  return axios.patch(apiUrl, { status }, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY,
    }
  }).then((res) => {
    return res
  })
}