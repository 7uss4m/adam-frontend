import axios from "axios";

export default function postLevel(token: string, name: string, max: number
) {

  const apiUrl = `${import.meta.env.VITE_API_URL}levels`;
  return axios
    .post(
      apiUrl,
      { name, max },
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
