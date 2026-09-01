import { useEffect, useState } from "react";
import { messaging } from "../firebase/firebaseConfig";
import { getToken } from "firebase/messaging";

const useFCMToken = (enabled: boolean = true) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          const token = await getToken(messaging, {
            vapidKey: "BG5_ddsoxhMHZ2Wq8bm5Y_JHXdf1vMXHLiV9QvaMg58rxcXfmSFs86cHTI-14nCk1C7NCM-t5aRibMQwuoCr6bw", // Replace with your actual key
            serviceWorkerRegistration: registration,
          });
          setFcmToken(token);
          setPermissionGranted(true);
        }
      } catch (err) {
        console.error("Error getting FCM token", err);
      }
    };

    requestPermission();
  }, [enabled]);


  return { fcmToken, permissionGranted };
};

export default useFCMToken;
