import type { Note } from "../../types/types";
import { getBoxName, getCurrencyName, parseNoteDate } from "../../lib/payment-note-display";

export type NoteFilterKey = "all" | "pinding" | "success" | "reject";

export type DashboardNote = Note & {
  currencyName?: string;
  boxName?: string;
  username?: string;
  email?: string;
};

export function noteImageUrl(image?: string | null) {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  const base = import.meta.env.VITE_PUBLIC_DOMAIN || "";
  return `${base}${image}`;
}

export function fmtCoins(value: number | string) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function noteStatusKey(status: string): NoteFilterKey | "unknown" {
  if (status === "pinding" || status === "success" || status === "reject") {
    return status;
  }
  return "unknown";
}

export function mapNote(raw: Note): DashboardNote {
  return {
    ...raw,
    boxName: getBoxName(raw.currencies),
    currencyName: getCurrencyName(raw.currencies),
    email: raw.user?.email ?? "",
    username: raw.user?.user_name ?? "—",
  };
}

export function formatNoteDate(dateStr: unknown, locale: string) {
  const date = parseNoteDate(dateStr);
  if (!date) return "—";
  return date.toLocaleString(locale === "ar" ? "ar-SY" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeNoteTime(dateStr: unknown, locale: string) {
  const date = parseNoteDate(dateStr);
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return locale === "ar" ? "الآن" : "Just now";
  if (diffMin < 60) return locale === "ar" ? `منذ ${diffMin} د` : `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return locale === "ar" ? `منذ ${diffH} س` : `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return locale === "ar" ? `منذ ${diffD} ي` : `${diffD}d ago`;
}
