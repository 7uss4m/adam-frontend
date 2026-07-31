import axios from "axios"

export default function postResetPassword(data: { email: string, code: string, password: string }) {

  const apiUrl = `${import.meta.env.VITE_API_URL}users/password/reset`;
  return axios.post(apiUrl, { ...data }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
    }
  }).then((res) => {
    return res
  })
}
