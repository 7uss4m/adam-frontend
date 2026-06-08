import axios from "axios";

export default function postInventory(token: string, data: {
  "sub_categoryId": number,
  "total_quantity": number,
  "total_price": number
}
) {

  const apiUrl = `${import.meta.env.VITE_API_URL}inventories`;
  return axios
    .post(
      apiUrl,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
      }
    )
    .then((res) => {
      return res;
    });
}
