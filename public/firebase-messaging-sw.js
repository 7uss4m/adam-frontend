
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');
/* eslint-enable no-undef */
// eslint-disable-next-line no-undef
firebase.initializeApp({
  apiKey: "AIzaSyA4GJmhftkGDlpuxVpo96RV2IQKVHvLhDI",
  authDomain: "mincard-3fb47.firebaseapp.com",
  projectId: "mincard-3fb47",
  storageBucket: "mincard-3fb47.appspot.com",
  messagingSenderId: "176290294021",
  appId: "1:176290294021:web:9d2ff2af177f6d3ae4af6c",
  measurementId: "G-HYH2XYDY5C"
});





// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

// Set up background message handler
messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png', // Optional icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});