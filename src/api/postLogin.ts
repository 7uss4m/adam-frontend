import axios from "axios"

export default function postLogin(data: { email: string, password: string }) {

  const apiUrl = `${import.meta.env.VITE_API_URL}users/signin`;
  return axios.post(apiUrl, { ...data }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,

    }
  }).then((res) => {
    return res
  })
}