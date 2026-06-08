import axios from "axios";

export default function putLevel(token: string, levelId: string, name: string, max: number, profit: number
) {

  const apiUrl = `${import.meta.env.VITE_API_URL}levels/${levelId}`;
  return axios
    .put(
      apiUrl,
      { name, max, profit },
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
