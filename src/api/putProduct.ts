import axios from "axios";

export default function putProduct(
  token: string,
  data: {
    name: string;
    image: File | undefined;
    category_id: string;
    price: string
    description: string
    order: number
  },
  id: string
) {

  const apiUrl = `${import.meta.env.VITE_API_URL}products/${id}`;
  return axios
    .put(
      apiUrl,
      { ...data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": import.meta.env.VITE_API_KEY,
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((res) => {
      return res;
    });
}
