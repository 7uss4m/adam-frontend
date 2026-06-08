import axios from "axios"

export default function getInfo(token: string, info: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}settings/?content=${info}`;
  return axios.get(apiUrl, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  }).catch(error => {
    console.error(error)
    return error
  })
}