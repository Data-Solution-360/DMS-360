import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDRxZz6FrU3hG2R_gLhYVx7lARfW068Gt0",
  authDomain: "dms-management-a5c3a.firebaseapp.com",
  projectId: "dms-management-a5c3a",
  storageBucket: "dms-management-a5c3a.firebasestorage.app",
  messagingSenderId: "158301822868",
  appId: "1:158301822868:web:989377cde0c3fd98123981",
};

// Debug: Log the configuration (remove in production)
console.log("[Firebase] Config check:", {
  apiKey: firebaseConfig.apiKey ? "Set" : "Missing",
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId ? "Set" : "Missing",
  appId: firebaseConfig.appId ? "Set" : "Missing",
});

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);
const db = getFirestore(app);

export { db, storage };
