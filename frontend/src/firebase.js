import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDc0RJWNSBr3bw1OGWHnf7q06iklghQ380",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "parkshare-40123.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "parkshare-40123",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "parkshare-40123.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "35476692209",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:35476692209:web:5cefd8b5f653e816eb5d50",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-E0HVPHSLJW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;