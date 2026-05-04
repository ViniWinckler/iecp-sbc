import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA_0KiSaa6FtSffrboDq5xHU1iRifLd_OI",
  authDomain: "igreja-iecp-sbc.firebaseapp.com",
  projectId: "igreja-iecp-sbc",
  storageBucket: "igreja-iecp-sbc.firebasestorage.app",
  messagingSenderId: "690074634893",
  appId: "1:690074634893:web:065f22e4ae0d9e721630c4",
  measurementId: "G-H0TFTY9ZJ0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
