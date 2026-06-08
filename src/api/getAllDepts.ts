import axios from "axios"

export default function getAllDepts(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}depts`;
  return axios.get(apiUrl, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      'Authorization': `Bearer ${token}`
    }
  }).then((res) => {
    return res
  }).catch(error => {
    console.error(error)
    return error
  })
}