import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const OLD_DOMAIN = "https://omc.weisro.com/omcard";
const NEW_DOMAIN = (import.meta.env.VITE_PUBLIC_DOMAIN || "https://api.ubba-stoer.com/adam").replace(/\/$/, "");

export function fixImageUrl(url?: string | null): string {
  if (!url) return "";
  return url.replace(OLD_DOMAIN, NEW_DOMAIN);
}
