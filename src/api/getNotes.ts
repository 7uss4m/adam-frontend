import axios from "axios";

type GetNotesParams = {
  token: string;
  page?: string;
  filter?: string;
  search?: string;
};

export default function getNotes({
  token,
  page = "1",
  filter = "all",
  search = "",
}: GetNotesParams) {
  const apiUrl = `${import.meta.env.VITE_API_URL}notes`;
  return axios.get(apiUrl, {
    params: {
      page,
      filter: filter !== "all" ? filter : undefined,
      search: search || undefined,
    },
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
}
