import axios from "axios";

export default function putInventory(token: string, inventoryId: number, data: {
  total_quantity: number
  total_price: number
}
) {

  const apiUrl = `${import.meta.env.VITE_API_URL}inventories/${inventoryId}`;
  return axios
    .put(
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
