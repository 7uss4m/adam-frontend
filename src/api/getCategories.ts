import axios from "axios"

export default function getCategories() {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories`;
  return axios.get(apiUrl, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  }).catch(error => {
    console.error(error)
    return error
  })
}