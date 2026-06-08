import axios from "axios";

export default function postOrder(
  token: string,
  data: Record<string, unknown>
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}orders`;
  return axios
    .post(
      apiUrl,
      data,
      {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      return res;
    });
}
