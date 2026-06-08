import axios from "axios"

export default function postFcmToken(token: string, fcm_token: string) {

  const apiUrl = `${import.meta.env.VITE_API_URL}users/refresh/fcm`;
  return axios.post(apiUrl, { fcm_token }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`,
    }
  }).then((res) => {
    return res
  })
}