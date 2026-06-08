import axios from "axios"

export default function postVerifyEmail(data: { email: string, code: string }) {

  const apiUrl = `${import.meta.env.VITE_API_URL}users/email/verify`;
  return axios.post(apiUrl, { ...data }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,

    }
  }).then((res) => {
    return res
  })
}