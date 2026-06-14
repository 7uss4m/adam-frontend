import getInfo from "../../api/getInfo";
import getMoonPay from "../../api/getMoonPay";

export type SiteSettings = {
  dollar_exchange: string;
  tr_exchange: string;
  dash_exchange: string;
  email: string;
  phone: string;
  telegram: string;
  facebook: string;
  whatsup: string;
  privacy: string;
  aboutus: string;
  moonPay_code: string;
};

const INFO_FIELDS = [
  "dollar_exchange",
  "tr_exchange",
  "dash_exchange",
  "email",
  "phone",
  "telegram",
  "facebook",
  "whatsup",
  "privacy",
  "aboutus",
] as const;

function pickFieldValue(
  data: Record<string, unknown> | null | undefined,
  field: string
): string {
  const raw = data?.[field];
  if (raw == null) return "";
  return String(raw);
}

export async function fetchSiteSettings(token: string): Promise<SiteSettings> {
  const entries = await Promise.all(
    INFO_FIELDS.map(async (field) => {
      try {
        const response = await getInfo(token, field);
        return [field, pickFieldValue(response.data?.date, field)] as const;
      } catch {
        return [field, ""] as const;
      }
    })
  );

  let moonPay_code = "";
  try {
    const moonRes = await getMoonPay(token);
    moonPay_code = String(moonRes.data?.date ?? "");
  } catch {
    moonPay_code = "";
  }

  return {
    ...Object.fromEntries(entries),
    moonPay_code,
  } as SiteSettings;
}

export function truncateText(value: string, max = 120) {
  if (!value) return "—";
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}
