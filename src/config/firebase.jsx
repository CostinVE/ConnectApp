import { initializeApp } from "firebase/app";
import { getAuth as firebaseGetAuth, GoogleAuthProvider } from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'
import { getStorage, ref } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3STio6siQ5G9hTRg-wRx07La6Fp3GNrY",
  authDomain: process.env.NODE_ENV === 'development' ? "http://127.0.0.1:4000/auth" : "connectapp-9f243.firebaseapp.com",
  projectId: "connectapp-9f243",
  storageBucket: "connectapp-9f243.appspot.com",
  messagingSenderId: "75341260922",
  appId: "1:75341260922:web:444f3c55405c6374bdf3c3",
  measurementId: "G-6CR35RSBJP",
  databaseURL: process.env.NODE_ENV === 'development' ? "http://localhost:8080?ns=connectapp-9f243" : "http://127.0.0.1:4000/database "
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = firebaseGetAuth(app)
export const googleProvider =  new GoogleAuthProvider

export const database = getFirestore(app)
export const storage = getStorage(app)
