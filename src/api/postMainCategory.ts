import axios from "axios";

export default function postMainCategory(
  token: string,
  name: string,
  order: number,
  image: File
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}main-categories`;
  const form = new FormData();
  form.append("name", name);
  form.append("order", String(order));
  form.append("image", image);

  return axios
    .post(apiUrl, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": import.meta.env.VITE_API_KEY,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res);
}
