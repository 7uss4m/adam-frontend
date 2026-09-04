import axios from "axios";

export default function getCategoriesByMainCategory(id: number | string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}main-categories/${id}/categories`;
  return axios
    .get(apiUrl, {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => res)
    .catch((error) => {
      console.error(error);
      return error;
    });
}
