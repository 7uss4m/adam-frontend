import axios from "axios";

type GetCategoriesParams = {
  token?: string;
  search?: string;
  filter?: string;
};

export default function getCategories(params?: GetCategoriesParams) {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories`;
  const headers: Record<string, string> = {
    "x-api-key": import.meta.env.VITE_API_KEY,
  };

  if (params?.token) {
    headers.Authorization = `Bearer ${params.token}`;
  }

  return axios
    .get(apiUrl, {
      headers,
      params: {
        search: params?.search || undefined,
        filter: params?.filter && params.filter !== "all" ? params.filter : undefined,
      },
    })
    .then((res) => res)
    .catch((error) => {
      console.error(error);
      return error;
    });
}
