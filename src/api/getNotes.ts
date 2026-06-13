import axios from "axios";

type GetNotesParams = {
  token: string;
  page?: string;
  filter?: string;
  search?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  exportAll?: boolean;
};

export default function getNotes({
  token,
  page = "1",
  filter = "all",
  search = "",
  userId,
  dateFrom,
  dateTo,
  exportAll = false,
}: GetNotesParams) {
  const apiUrl = `${import.meta.env.VITE_API_URL}notes`;
  return axios.get(apiUrl, {
    params: {
      page: exportAll ? undefined : page,
      filter: filter !== "all" ? filter : undefined,
      search: search || undefined,
      user: userId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      export: exportAll ? "true" : undefined,
    },
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
}
