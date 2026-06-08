import axios from "axios"

export default function postAdmin(token: string, data: {
  user_name: string,
  email: string,
  password: string
}) {

  const apiUrl = `${import.meta.env.VITE_API_URL}admin`;
  return axios.post(apiUrl, data, {

    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}