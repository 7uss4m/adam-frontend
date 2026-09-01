import axios from "axios";

type PutCategoryPayload = {
  name?: string;
  order?: number;
  active?: boolean;
  image?: File;
  profit?: number;
};

export default function putCategory(
  token: string,
  id: string,
  payload: PutCategoryPayload
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories/${id}`;
  const form = new FormData();
  if (payload.name !== undefined) form.append("name", payload.name);
  if (payload.order !== undefined) form.append("order", String(payload.order));
  if (payload.active !== undefined) form.append("active", String(payload.active));
  if (payload.image) form.append("image", payload.image);
  if (payload.profit !== undefined) form.append("profit", String(payload.profit));

  return axios
    .put(apiUrl, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": import.meta.env.VITE_API_KEY,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res);
}
