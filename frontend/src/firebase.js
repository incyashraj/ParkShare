import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDc0RJWNSBr3bw1OGWHnf7q06iklghQ380",
  authDomain: "parkshare-40123.firebaseapp.com",
  projectId: "parkshare-40123",
  storageBucket: "parkshare-40123.firebasestorage.app",
  messagingSenderId: "35476692209",
  appId: "1:35476692209:web:5cefd8b5f653e816eb5d50",
  measurementId: "G-E0HVPHSLJW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;