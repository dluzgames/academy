import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAkWAj9lIEvkYFSAHX10vjINWq-jOEGBPQ",
    authDomain: "elite-velocity-v2-dluz.firebaseapp.com",
    projectId: "elite-velocity-v2-dluz",
    storageBucket: "elite-velocity-v2-dluz.firebasestorage.app",
    messagingSenderId: "50663781652",
    appId: "1:50663781652:web:3e1ea74744b89dc9b63e01"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
