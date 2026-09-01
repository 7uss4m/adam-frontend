self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { title: "Notification", message: event.data ? event.data.text() : "" };
  }

  const title = data.title || "AdamZone";
  const options = {
    body: data.message || "",
    icon: "/logo.webp",
    data: { click: data.click || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.click) || "/";
  event.waitUntil(clients.openWindow(url));
});
