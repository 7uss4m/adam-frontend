import axios from "axios"


export default function patchOrderStatus(token: string, id: string, status: string, replay?: string) {

  const apiUrl = `${import.meta.env.VITE_API_URL}orders/status/${id}`;
  return axios.patch(apiUrl, { status, replay: replay || "" }, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY,
    }
  }).then((res) => {
    return res
  })
}