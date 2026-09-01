import { useEffect, useState } from "react";
import { NOTIFICATION_PROVIDER, NTFY_VAPID_PUBLIC_KEY } from "../notifications/config";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const useNtfyPush = () => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const subscribe = async () => {
      if (
        NOTIFICATION_PROVIDER !== "ntfy" ||
        !NTFY_VAPID_PUBLIC_KEY ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const registration = await navigator.serviceWorker.register("/ntfy-sw.js", { scope: "/ntfy/" });
        const existing = await registration.pushManager.getSubscription();
        const sub =
          existing ||
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(NTFY_VAPID_PUBLIC_KEY),
          }));

        setSubscription(sub);
        setPermissionGranted(true);
      } catch (err) {
        console.error("Error subscribing to ntfy push", err);
      }
    };

    subscribe();
  }, []);

  return { subscription, permissionGranted };
};

export default useNtfyPush;
