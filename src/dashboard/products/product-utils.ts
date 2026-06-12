import logo from "../../assets/logo.webp";
import { Product } from "../../types/types";

export function getProductImageUrl(image?: string | null) {
  if (!image) return logo;
  if (image.startsWith("http")) return image;
  const base = import.meta.env.VITE_PUBLIC_DOMAIN || "";
  return `${base}${image}`;
}

export function isOfferCurrentlyActive(product: Product) {
  if (!product.offer_active) return false;

  const now = new Date();
  if (product.offer_start_at && now < new Date(product.offer_start_at)) {
    return false;
  }
  if (product.offer_end_at && now > new Date(product.offer_end_at)) {
    return false;
  }

  if (product.offer_type === "percent") {
    return (product.discount_percent ?? 0) > 0;
  }
  if (product.offer_type === "fixed") {
    return (product.offer_price ?? 0) > 0;
  }

  return false;
}

export function getOfferStatusKey(product: Product) {
  if (!product.offer_active) return "offer_none";
  const now = new Date();
  if (product.offer_start_at && now < new Date(product.offer_start_at)) {
    return "offer_scheduled";
  }
  if (product.offer_end_at && now > new Date(product.offer_end_at)) {
    return "offer_expired";
  }
  return "offer_active_status";
}

export function getOfferStatusText(
  product: Product,
  t: (key: string) => string
) {
  const status = getOfferStatusKey(product);
  if (!product.offer_active) return t(status);
  if (product.offer_type === "percent" && product.discount_percent) {
    return `${t(status)} (${product.discount_percent}%)`;
  }
  if (product.offer_type === "fixed" && product.offer_price != null) {
    return `${t(status)} ($${product.offer_price})`;
  }
  return t(status);
}

export function getProductStats(products: Product[]) {
  const active = products.filter((p) => p.active).length;
  const withOffers = products.filter(isOfferCurrentlyActive).length;

  return {
    total: products.length,
    active,
    inactive: products.length - active,
    withOffers,
  };
}

export function filterProducts(
  products: Product[],
  {
    search,
    status,
    offer,
  }: {
    search: string;
    status: "all" | "active" | "inactive";
    offer: "all" | "offer" | "no_offer";
  }
) {
  const q = search.trim().toLowerCase();

  return products.filter((product) => {
    if (status === "active" && !product.active) return false;
    if (status === "inactive" && product.active) return false;

    const hasOffer = isOfferCurrentlyActive(product);
    if (offer === "offer" && !hasOffer) return false;
    if (offer === "no_offer" && hasOffer) return false;

    if (!q) return true;

    const categoryName = product.categories?.name?.toLowerCase() ?? "";
    return (
      product.name.toLowerCase().includes(q) ||
      String(product.id).includes(q) ||
      categoryName.includes(q) ||
      (product.source?.toLowerCase().includes(q) ?? false)
    );
  });
}
