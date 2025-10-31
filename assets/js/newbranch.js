import {
  db, getDoc, doc, addDoc, updateDoc, deleteDoc,
  collection, getDocs, query, orderBy, where, serverTimestamp
} from './database.js';

const newBranchPopup = document.getElementById("newBranchPopup");
const cancelBtn = document.getElementById("cancelDtl");

document.getElementById("saveDtl").onclick = async () => {
  const name = document.getElementById("branchName").value.trim();
  const lat = parseFloat(document.getElementById("latIn").value);
  const lon = parseFloat(document.getElementById("lngIn").value);
  const radius = parseInt(document.getElementById("radius").value);
  const bCode = document.getElementById("bCode").value.trim();
  const opendt = document.getElementById("opnDt").value;
  const group = document.getElementById("companyIn").value.trim();
  const phone = document.getElementById("phoneIn").value.trim();
  const email = document.getElementById("emailIn").value.trim();
  const address = document.getElementById("addressIn").value.trim();

  if (!name || !bCode || !group || !phone ) {
    return alert("⚠️ Please fill all required fields correctly.");
  }

  await addDoc(collection(db, "branches"), {
    name,
    lat: lat,
    lng: lon,
    radius_m: radius,
    bCode,
    opendt,
    group,
    phone,
    email,
    address,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  alert("✅ Branch added successfully!");
  newBranchPopup.style.display = "none";


};

cancelBtn.addEventListener("click", () => {
  newBranchPopup.style.display = "none";
 
});
