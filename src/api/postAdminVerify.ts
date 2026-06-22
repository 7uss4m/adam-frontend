import axios from "axios";

export default function postAdminVerify(email: string, code: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}users/signin/admin/verify`;
  return axios.post(apiUrl, { email, code }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
    },
  });
}