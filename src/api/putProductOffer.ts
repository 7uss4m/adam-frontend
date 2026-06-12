import axios from "axios";

export type ProductOfferPayload = {
  offer_active: boolean;
  offer_type?: "percent" | "fixed";
  discount_percent?: number;
  offer_price?: number;
  offer_start_at?: string | null;
  offer_end_at?: string | null;
};

export default function putProductOffer(
  token: string,
  productId: string,
  data: ProductOfferPayload
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}products/${productId}/offer`;
  return axios.put(apiUrl, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Content-Type": "application/json",
    },
  });
}
