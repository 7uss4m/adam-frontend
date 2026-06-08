import axios from "axios"

export default function postAdminLogin(email: string, password: string) {

  const apiUrl = `${import.meta.env.VITE_API_URL}users/signin/admin`;
  return axios.post(apiUrl, { email,password }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}