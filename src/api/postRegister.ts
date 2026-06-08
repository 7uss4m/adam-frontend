import axios from "axios"

export default function postRegister(data: { user_name: string, email: string, password: string, invite_code?: string }) {

  const apiUrl = `${import.meta.env.VITE_API_URL}users/signup`;
  return axios.post(apiUrl, { ...data, "finger_print": "trrrgrgggggg" }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
    }
  }).then((res) => {
    return res
  })
}
