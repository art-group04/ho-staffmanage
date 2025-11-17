import { db, addDoc, collection, serverTimestamp } from './database.js';

const newBranchPopup = document.getElementById("newBranchPopup");
const cancelBtn = document.getElementById("cancelDtl");

document.getElementById("saveDtl").onclick = async () => {
  const name = document.getElementById("branchName").value.trim();  
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
    lat: "",
    lng: "",
    radius_m:"",
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
