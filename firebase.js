const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
module.exports = db;

/* Copied from Firebase sdk
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPrmDt5lF3k8ztabxakQ7IBHaFaBLb4UA",
  authDomain: "fantasy-cricket-group.firebaseapp.com",
  projectId: "fantasy-cricket-group",
  storageBucket: "fantasy-cricket-group.firebasestorage.app",
  messagingSenderId: "877806220984",
  appId: "1:877806220984:web:76b463dbc231977590664d",
  measurementId: "G-YNXG2L07KP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); */
