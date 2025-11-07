// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore,  getDoc,  doc,  addDoc,  updateDoc, deleteDoc,  collection,  getDocs,  query,  where, orderBy,  serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyCOcsL9ahdFUunWDAcv5JZdnMxMZehquhg",
    authDomain: "art-staffmanage.firebaseapp.com",
    projectId: "art-staffmanage",
    storageBucket: "art-staffmanage.firebasestorage.app",
    messagingSenderId: "951269778971",
    appId: "1:951269778971:web:11fbb26385588ced133abe"  
    

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db,  getDoc,  doc,  addDoc,  updateDoc, deleteDoc,  collection,  getDocs,  query, orderBy,  where,  serverTimestamp };
