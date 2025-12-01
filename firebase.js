// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { 
  getAuth, 
  signInAnonymously 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// DEINE Firebase Config (1:1 von dir übernommen)
export const firebaseConfig = {
  apiKey: "AIzaSyATET7R0SplwxV3XBRbtYi5EFIRIEEQUDE",
  authDomain: "fpsio-ecd0d.firebaseapp.com",
  projectId: "fpsio-ecd0d",
  storageBucket: "fpsio-ecd0d.firebasestorage.app",
  messagingSenderId: "1034267085728",
  appId: "1:1034267085728:web:e9a9080faa84090fc5b2c5",
  measurementId: "G-DP7YP37MVF"
};

// Firebase starten
const app = initializeApp(firebaseConfig);

// Dienste
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auto Login
export async function initAuth() {
  try {
    const result = await signInAnonymously(auth);
    console.log("🔥 Logged in:", result.user.uid);
    return result.user.uid;
  } catch (e) {
    console.error("Auth error:", e);
  }
}

