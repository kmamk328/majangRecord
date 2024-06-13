// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzzCOyVO5j1-YfY2mTRYhu-4aQbCLzIDA",
  authDomain: "majangrecords.firebaseapp.com",
  projectId: "majangrecords",
  storageBucket: "majangrecords.appspot.com",
  messagingSenderId: "476948101334",
  appId: "1:476948101334:web:50f008f55281199111b177",
  measurementId: "G-M1CZSRTVLK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);


export { db };