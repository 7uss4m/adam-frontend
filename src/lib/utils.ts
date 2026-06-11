import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const OLD_DOMAIN = "https://omc.weisro.com/omcard";
const NEW_DOMAIN = "https://adam.ak-store.digital/adam";

export function fixImageUrl(url?: string | null): string {
  if (!url) return "";
  return url.replace(OLD_DOMAIN, NEW_DOMAIN);
}
