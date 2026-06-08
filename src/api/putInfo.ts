import axios from "axios";

export default function putInfo(token: string, text: string, info: string
) {

  const apiUrl = `${import.meta.env.VITE_API_URL}settings/?content=${info}`;
  return axios
    .put(
      apiUrl,
      { text },
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
