import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBbAW88zODKhCryqWqDTOH5MhWulSk41x8",
    authDomain: "elite-velocity-dluz.firebaseapp.com",
    projectId: "elite-velocity-dluz",
    storageBucket: "elite-velocity-dluz.firebasestorage.app",
    messagingSenderId: "321033009463",
    appId: "1:321033009463:web:3d49cf4f0ff0b0ab8e82b2"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
