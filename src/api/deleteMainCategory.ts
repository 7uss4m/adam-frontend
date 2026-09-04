import axios from "axios";

export default function deleteMainCategory(token: string, id: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}main-categories/${id}`;
  return axios
    .delete(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => res);
}
