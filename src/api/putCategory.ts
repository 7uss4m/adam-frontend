import axios from "axios";

type PutCategoryPayload = {
  name?: string;
  order?: number;
  active?: boolean;
  image?: File;
  profit?: number;
  main_category_id?: number | null;
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
  if (payload.main_category_id !== undefined) {
    form.append(
      "main_category_id",
      payload.main_category_id === null ? "" : String(payload.main_category_id)
    );
  }

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
