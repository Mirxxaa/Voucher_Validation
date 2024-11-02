// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgaRgB17CuxlOo9r2KAvXE5F7XvJO9KKA",
  authDomain: "formvalidation1-b1fe8.firebaseapp.com",
  projectId: "formvalidation1-b1fe8",
  storageBucket: "formvalidation1-b1fe8.firebasestorage.app",
  messagingSenderId: "296681947556",
  appId: "1:296681947556:web:47e7be38085b5e4ab14131",
  measurementId: "G-3Z3983CPC1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
