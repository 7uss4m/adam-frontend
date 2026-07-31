import axios from "axios"

export default function postForgotPassword(data: { email: string }) {

  const apiUrl = `${import.meta.env.VITE_API_URL}users/password/forgot`;
  return axios.post(apiUrl, { ...data }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
    }
  }).then((res) => {
    return res
  })
}
