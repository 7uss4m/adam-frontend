import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "mincard-3fb47.firebaseapp.com",
  projectId: "mincard-3fb47",
  storageBucket: "mincard-3fb47.appspot.com",
  messagingSenderId: "176290294021",
  appId: "1:176290294021:web:9d2ff2af177f6d3ae4af6c",
  measurementId: "G-HYH2XYDY5C"
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export { messaging };