import type { Note } from "../../types/types";

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
    boxName: raw.currencies?.boxes?.name ?? "",
    currencyName: raw.currencies?.name ?? "",
    email: raw.user?.email ?? "",
    username: raw.user?.user_name ?? "—",
  };
}

export function formatNoteDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  return date.toLocaleString(locale === "ar" ? "ar-SY" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeNoteTime(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return locale === "ar" ? "الآن" : "Just now";
  if (diffMin < 60) return locale === "ar" ? `منذ ${diffMin} د` : `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return locale === "ar" ? `منذ ${diffH} س` : `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return locale === "ar" ? `منذ ${diffD} ي` : `${diffD}d ago`;
}
