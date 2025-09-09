// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB01UkGcMTE1C5kP165UL5KYe0hGe9F-LA",
  authDomain: "properties-1938e.firebaseapp.com",
  databaseURL: "https://properties-1938e-default-rtdb.firebaseio.com",
  projectId: "properties-1938e",
  storageBucket: "properties-1938e.firebasestorage.app", // ✅ correct

  messagingSenderId: "17595301841",
  appId: "1:17595301841:web:417f226ec368a15eb1aaf0",
  measurementId: "G-KVE1659DRS"
};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

const analytics = getAnalytics(app);
