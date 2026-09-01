import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import useFCMToken from "../hooks/useFcmToken";
import useNtfyPush from "../hooks/useNtfyPush";
import postFcmToken from "../api/postFcmToken";
import postNtfySubscription from "../api/postNtfySubscription";
import { NOTIFICATION_PROVIDER } from "./config";

export default function useNotifications(token: string | undefined, ready: boolean) {
  const { fcmToken } = useFCMToken();
  const { subscription } = useNtfyPush();

  const postFcmTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await postFcmToken(token as string, fcmToken as string);
      return response.data;
    },
  });

  const postNtfySubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!subscription) throw new Error("No push subscription");
      const json = subscription.toJSON();
      const response = await postNtfySubscription(token as string, {
        endpoint: json.endpoint as string,
        keys: {
          auth: json.keys!.auth,
          p256dh: json.keys!.p256dh,
        },
      });
      return response.data;
    },
  });

  useEffect(() => {
    if (!ready || !token) return;
    if (NOTIFICATION_PROVIDER === "ntfy") {
      if (subscription) postNtfySubscriptionMutation.mutate();
    } else if (fcmToken) {
      postFcmTokenMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token, fcmToken, subscription]);
}
