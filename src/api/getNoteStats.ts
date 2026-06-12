import axios from "axios";

export type NoteStats = {
  pending: number;
  success: number;
  rejected: number;
  pendingAmount: number;
  todaySuccess: number;
  monthSuccess: number;
  todayPending: number;
};

export default function getNoteStats(token: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}notes/stats`;
  return axios
    .get<{ result: NoteStats }>(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => res);
}
