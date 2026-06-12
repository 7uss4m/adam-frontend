import axios from "axios"

export default function getUsers(data: {
  token: string;
  page?: number;
  search?: string;
  filter?: string;
}) {
  const apiUrl = `${import.meta.env.VITE_API_URL}users/all`;
  return axios
    .get(apiUrl, {
      params: {
        page: data?.page,
        search: data?.search,
        filter: data?.filter,
      },
    headers: {
      "Authorization": `Bearer ${data.token}`,
      "x-api-key": import.meta.env.VITE_API_KEY
    }
  }).then((res) => {
    return res
  })
}