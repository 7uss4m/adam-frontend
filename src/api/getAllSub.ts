import axios from "axios";

type GetAllSubParams = {
  token?: string;
  search?: string;
  filter?: string;
  parentId?: string;
};

export default function getAllSub(params?: GetAllSubParams) {
  const apiUrl = params?.parentId
    ? `${import.meta.env.VITE_API_URL}categories/sub/${params.parentId}`
    : `${import.meta.env.VITE_API_URL}categories/sub`;

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
        parent_id: params?.parentId || undefined,
      },
    })
    .then((res) => res)
    .catch((error) => {
      console.error(error);
      return error;
    });
}
