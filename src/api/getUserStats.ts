import axios from "axios";

export type UserStats = {
  total: number;
  verified: number;
  newThisMonth: number;
  totalBalance: number;
  withDebt: number;
  totalDebt: number;
};

export default function getUserStats(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}users/stats`;
  return axios
    .get<{ result: UserStats }>(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => res);
}
