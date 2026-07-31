import logo from "../assets/logo.webp";
import { Product } from "../types/types";

export function getProductImageUrl(image?: string | null) {
  if (!image) return logo;
  if (image.startsWith("http")) return image;
  const base = import.meta.env.VITE_PUBLIC_DOMAIN || "";
  return `${base}${image}`;
}

export function isOfferActive(product: Product) {
  if (!product.offer_active) return false;
  const now = new Date();
  if (product.offer_start_at && now < new Date(product.offer_start_at)) return false;
  if (product.offer_end_at && now > new Date(product.offer_end_at)) return false;
  if (product.offer_type === "percent") return (product.discount_percent ?? 0) > 0;
  if (product.offer_type === "fixed") return (product.offer_price ?? 0) > 0;
  return product.hasOffer === true;
}

export function getProductPath(product: Product) {
  const categoryId = product.categoryId ?? product.categories?.id;
  if (!categoryId) return "/categories";
  // Products belong to parent categories; direct purchase URL
  return `/categories/${categoryId}/product/${product.id}`;
}

export function formatUsd(price: number | string) {
  return `$${Number(price).toFixed(2)}`;
}

export function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}
