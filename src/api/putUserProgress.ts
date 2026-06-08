import axios from "axios"

export default function putUserProgress(token: string, id: string, progress: number) {

  const apiUrl = `${import.meta.env.VITE_API_URL}users/progress/${id}`;
  return axios.put(apiUrl, { progress }, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY

    }
  }).then((res) => {
    return res
  })
}