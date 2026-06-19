// --- src/firebase.js ---
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB7ax2jomAK6kjqxsDZ4jg6bhq6VmHVYDI",
  authDomain: "refp-7e6a6.firebaseapp.com",
  projectId: "refp-7e6a6",
  storageBucket: "refp-7e6a6.firebasestorage.app",
  messagingSenderId: "957147520306",
  appId: "1:957147520306:web:d879d1aad6f080c77a0b2b",
  measurementId: "G-WRYYJDSLRC"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);