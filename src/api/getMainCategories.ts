import axios from "axios";

type GetMainCategoriesParams = {
  token?: string;
};

export default function getMainCategories(params?: GetMainCategoriesParams) {
  const apiUrl = `${import.meta.env.VITE_API_URL}main-categories`;
  const headers: Record<string, string> = {
    "x-api-key": import.meta.env.VITE_API_KEY,
  };

  if (params?.token) {
    headers.Authorization = `Bearer ${params.token}`;
  }

  return axios.get(apiUrl, { headers }).then((res) => res);
}
