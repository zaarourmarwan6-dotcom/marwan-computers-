import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔥 Firebase config (تحطه مرة واحدة)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ➜ إضافة منتج
window.addProduct = async function () {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;

  if(!name || !price) return alert("Fill fields");

  await addDoc(collection(db, "products"), {
    name,
    price
  });

  document.getElementById("name").value = "";
  document.getElementById("price").value = "";

  loadProducts();
};

// ➜ تحميل المنتجات
async function loadProducts() {
  const snap = await getDocs(collection(db, "products"));
  const box = document.getElementById("products");

  box.innerHTML = "";

  snap.forEach((d) => {
    const p = d.data();

    box.innerHTML += `
      <div class="card">
        <h3>${p.name}</h3>
        <p>${p.price}</p>
        <button onclick="deleteProduct('${d.id}')">Delete</button>
      </div>
    `;
  });
}

// ➜ حذف
window.deleteProduct = async function(id){
  await deleteDoc(doc(db,"products",id));
  loadProducts();
};

loadProducts();
