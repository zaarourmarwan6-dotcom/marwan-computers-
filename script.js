import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyApGdzrA4CU5at0B4Qvc8J_Dp3-ElfZV94",
  authDomain: "marwan-computer.firebaseapp.com",
  projectId: "marwan-computer",
  storageBucket: "marwan-computer.firebasestorage.app",
  messagingSenderId: "466148301340",
  appId: "1:466148301340:web:0bd1766ded93d45e09ddd9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تجربة إضافة منتج
addDoc(collection(db, "products"), {
  name: "Test Product",
  price: 100
});
