export const NOTIFICATION_PROVIDER: "firebase" | "ntfy" =
  import.meta.env.VITE_NOTIFICATION_PROVIDER === "ntfy" ? "ntfy" : "firebase";

export const NTFY_VAPID_PUBLIC_KEY = import.meta.env.VITE_NTFY_VAPID_PUBLIC_KEY as string | undefined;
