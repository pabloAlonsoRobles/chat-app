// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQ7zzFXl5gSQbdybS_d4yiDNn36UVWPOA",
  authDomain: "chat-61b21.firebaseapp.com",
  projectId: "chat-61b21",
  storageBucket: "chat-61b21.firebasestorage.app",
  messagingSenderId: "789154051327",
  appId: "1:789154051327:web:964e1fa787ecbf5a8448ca",
  measurementId: "G-CVDHZ3W8V6"
};

// Initialize Firebase
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
let analytics;

// Only initialize analytics on the client side
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider, db }; 