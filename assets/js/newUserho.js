import { db, collection, addDoc, serverTimestamp } from "./database.js";

document.getElementById("saveBtn").onclick = async () => {
  const user = document.getElementById("nameIn").value.trim();
  const username = document.getElementById("userINname").value.trim();
  const password = document.getElementById("userpasswordIn").value.trim();
  const email = document.getElementById("useremail").value.trim();
  const role = document.getElementById("roleIn").value;
  const hoUserPopup = document.getElementById("hoUserPopup");

  if (!username || !password || !user) {
    alert("⚠️ Fill all user fields");
    return;
  }

  try {
    await addDoc(collection(db, "housers"), {
      username,
      password,
      role,
      user,
      email,
      createdAt: serverTimestamp(),
    });

    alert("✅ User created!");
    clearEmployeeForm();
    hoUserPopup.style.display = "none";
  } catch (error) {
    console.error("Error adding user:", error);
    alert("Failed to add user. Try again.");
  }
};

// 🔹 Helper: Clear all input & select fields
function clearEmployeeForm() {
  const fields = document.querySelectorAll("#hoUserPopup input, #hoUserPopup select");
  fields.forEach((field) => (field.value = ""));
}

// 🔹 Cancel button handler
const cancelDtl = document.getElementById("cancelDtl");
if (cancelDtl) {
  cancelDtl.onclick = () => {
    const hoUserPopup = document.getElementById("hoUserPopup");
    clearEmployeeForm();
    hoUserPopup.style.display = "none";
  };
}
