import axios from "axios";

export interface NtfySubscriptionPayload {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export default function postNtfySubscription(token: string, subscription: NtfySubscriptionPayload) {
  const apiUrl = `${import.meta.env.VITE_API_URL}users/notifications/ntfy/subscribe`;
  return axios
    .post(apiUrl, subscription, {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res);
}
