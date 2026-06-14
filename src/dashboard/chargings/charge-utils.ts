import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";

export type ChargeFilterKey = "all" | "admin" | "online" | "done" | "pending";

export type DashboardCharge = {
  id: string;
  coins: number;
  type: string;
  done: boolean;
  userId?: string | null;
  created_at: string;
  user?: {
    email?: string | null;
    user_name?: string | null;
  } | null;
  charged_by?: {
    email?: string | null;
    user_name?: string | null;
  } | null;
};

export function parseChargeCoins(raw: unknown): number {
  if (raw == null) return 0;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseFloat(raw.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof raw === "object") {
    const dec = raw as { toString?: () => string };
    if (typeof dec.toString === "function") {
      const n = parseFloat(dec.toString());
      return Number.isFinite(n) ? n : 0;
    }
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function mapCharge(raw: Record<string, unknown>): DashboardCharge {
  return {
    id: String(raw.id ?? ""),
    coins: parseChargeCoins(raw.coins),
    type: String(raw.type ?? "admin"),
    done: Boolean(raw.done),
    userId: raw.userId != null ? String(raw.userId) : null,
    created_at: String(raw.created_at ?? ""),
    user: (raw.user as DashboardCharge["user"]) ?? null,
    charged_by: (raw.charged_by as DashboardCharge["charged_by"]) ?? null,
  };
}

export function fmtCoins(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatChargeDate(iso: string, locale: string) {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), locale === "ar" ? "dd/MM/yyyy HH:mm" : "MMM dd, yyyy HH:mm");
  } catch {
    return iso.slice(0, 16).replace("T", " ");
  }
}

export function chargeTypeLabel(type: string, t: (k: string) => string) {
  if (type === "online") return t("charges_type_online");
  return t("charges_type_admin");
}

export function chargeStatusLabel(done: boolean, t: (k: string) => string) {
  return done ? t("charges_status_done") : t("charges_status_pending");
}

export function matchesChargeSearch(charge: DashboardCharge, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    charge.id,
    charge.user?.email,
    charge.user?.user_name,
    charge.charged_by?.email,
    charge.charged_by?.user_name,
    charge.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function matchesChargeFilter(charge: DashboardCharge, filter: ChargeFilterKey): boolean {
  switch (filter) {
    case "admin":
      return charge.type !== "online";
    case "online":
      return charge.type === "online";
    case "done":
      return charge.done;
    case "pending":
      return !charge.done;
    default:
      return true;
  }
}

export function matchesChargeDateRange(
  charge: DashboardCharge,
  range: DateRange | undefined
): boolean {
  if (!range?.from) return true;
  if (!charge.created_at) return false;
  try {
    const d = parseISO(charge.created_at);
    const from = startOfDay(range.from);
    const to = endOfDay(range.to ?? range.from);
    return isWithinInterval(d, { start: from, end: to });
  } catch {
    return true;
  }
}

export function computeChargeStats(charges: DashboardCharge[]) {
  let totalCoins = 0;
  let doneCount = 0;
  let pendingCount = 0;
  let adminCount = 0;
  let onlineCount = 0;
  let todayCount = 0;

  const todayStart = startOfDay(new Date());

  for (const c of charges) {
    totalCoins += c.coins;
    if (c.done) doneCount++;
    else pendingCount++;
    if (c.type === "online") onlineCount++;
    else adminCount++;
    try {
      if (parseISO(c.created_at) >= todayStart) todayCount++;
    } catch {
      /* skip */
    }
  }

  return {
    total: charges.length,
    totalCoins,
    doneCount,
    pendingCount,
    adminCount,
    onlineCount,
    todayCount,
  };
}
