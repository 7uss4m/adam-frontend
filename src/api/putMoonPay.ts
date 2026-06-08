import axios from "axios";

export default function putMoonPay(token: string, code: string
) {

  const apiUrl = `${import.meta.env.VITE_API_URL}settings/moon_pay_code`;
  return axios
    .put(
      apiUrl,
      { code },
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
