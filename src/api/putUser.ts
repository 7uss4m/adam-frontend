import axios from "axios"

export default function putUser(token: string, company: string, name: string) {

  const apiUrl = `${import.meta.env.VITE_API_URL}users`;
  return axios.put(apiUrl, { company, name }, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY

    }
  }).then((res) => {
    return res
  })
}