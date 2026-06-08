import axios from "axios"

export default function putProductState(token: string, id: string, state: number) {

  const apiUrl = `${import.meta.env.VITE_API_URL}products/status/${id}/?available=${state}`;
  return axios.put(apiUrl, null , {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY

    }
  }).then((res) => {
    return res
  })
}