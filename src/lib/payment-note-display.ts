import type { Note } from "../types/types";

type BoxLike = {
  name?: string | null;
  box_name?: string | null;
  account_name?: string | null;
};

export type NoteCurrency = Note["currencies"] & {
  boxes?: BoxLike | BoxLike[] | null;
};

function pickLabel(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

export function parseNoteDate(value: unknown): Date | null {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "[object Object]") return null;
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if (typeof obj.toISOString === "function") {
      const d = new Date(String(obj.toISOString()));
      return Number.isNaN(d.getTime()) ? null : d;
    }

    for (const key of ["iso", "date", "value", "$date"]) {
      const nested = obj[key];
      if (nested != null) {
        const parsed = parseNoteDate(nested);
        if (parsed) return parsed;
      }
    }

    if (typeof obj.seconds === "number") {
      const d = new Date(obj.seconds * 1000);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  return null;
}

export function getBoxName(currencies?: NoteCurrency | null): string {
  if (!currencies?.boxes) return "";

  const boxes = currencies.boxes;
  const list = Array.isArray(boxes) ? boxes : [boxes];

  for (const box of list) {
    const name =
      pickLabel(box?.name) ||
      pickLabel(box?.box_name) ||
      pickLabel(box?.account_name);
    if (name) return name;
  }

  return "";
}

export function getCurrencyName(currencies?: NoteCurrency | null): string {
  return pickLabel(currencies?.name);
}

export function formatPaymentAmount(note: Note): string {
  const coins = note.coins ?? "";
  const currency = getCurrencyName(note.currencies as NoteCurrency);
  return currency ? `${coins} ${currency}` : String(coins);
}

export function getPaymentTitle(note: Note, fallback: string): string {
  return getBoxName(note.currencies as NoteCurrency) || getCurrencyName(note.currencies as NoteCurrency) || fallback;
}

export type PaymentStatusMeta = {
  labelKey: "pinding" | "success" | "reject";
  className: string;
  variant: "pending" | "success" | "rejected";
};

export function getPaymentStatusMeta(status?: string): PaymentStatusMeta {
  const s = String(status || "pinding").toLowerCase();

  if (s === "success" || s === "accept" || s === "completed") {
    return {
      labelKey: "success",
      className:
        "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      variant: "success",
    };
  }

  if (s === "reject" || s === "failed" || s === "cancelled") {
    return {
      labelKey: "reject",
      className: "border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-400",
      variant: "rejected",
    };
  }

  return {
    labelKey: "pinding",
    className:
      "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400",
    variant: "pending",
  };
}

export function formatPaymentDateTime(created_at?: unknown, locale = "ar") {
  const d = parseNoteDate(created_at);
  if (!d) return { date: "", time: "", full: "" };

  const loc = locale === "ar" ? "ar-SY" : "en-US";
  const date = d.toLocaleDateString(loc, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString(loc, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { date, time, full: `${date} • ${time}` };
}
