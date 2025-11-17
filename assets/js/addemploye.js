import { db, addDoc, collection, serverTimestamp } from './database.js';
import { loadBranches } from "./utils/branchUtils.js";

let allData = [];

// 🔹 Initialize branch data
async function init() {
  allData = await loadBranches();
}

// 🔹 Call on page load
init();

// 🔹 Populate branch dropdown
async function populateBranchDropdown() {
  const branches = await loadBranches();

  // 🔹 Sort branches alphabetically by name
  branches.sort((a, b) => a.name.localeCompare(b.name));

  const dropdown = document.getElementById("branchIn");
  dropdown.innerHTML = `<option value="" disabled selected>Select Group</option>`;

  branches.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.name;
    dropdown.appendChild(opt);
  });
}


populateBranchDropdown();

// 🔹 Create new user
document.getElementById("saveDtl").onclick = async () => {
  const user = document.getElementById("stafName").value.trim();
  const username = document.getElementById("usernameIn").value.trim();
  const password = document.getElementById("passwordIn").value.trim();
  const branchId = document.getElementById("branchIn").value;
  const designation = document.getElementById("designationIn").value;
  const newEmployeePopup = document.getElementById("newEmployeePopup");

  if (!user || !username || !password || !branchId || !designation) {
    return alert("⚠️ Please fill all required fields!");
  }

  try {
    await addDoc(collection(db, "users"), {
      user,
      username,
      password,
      branchId,
      designation,
      deviceId: "",
      status: "active",
      createdAt: serverTimestamp(),
    });

    alert("✅ User created successfully!");
    clearEmployeeForm();
    newEmployeePopup.style.display = "none";

    if (typeof loadUsers === "function") {
      loadUsers();
    }
  } catch (err) {
    console.error("❌ Error adding user:", err);
    alert("⚠️ Error creating user. Check console for details.");
  }
};

// 🔹 Cancel button
const cancelBtn = document.getElementById("cancelDtl");
const newEmployeePopup = document.getElementById("newEmployeePopup");

cancelBtn.addEventListener("click", () => {
  clearEmployeeForm();
  newEmployeePopup.style.display = "none";
});

// 🔹 Helper: Clear all input & select fields
function clearEmployeeForm() {
  const fields = document.querySelectorAll(
    "#newEmployeePopup input, #newEmployeePopup select"
  );

  fields.forEach(el => {
    if (el.tagName === "SELECT") {
      el.selectedIndex = 0; // Reset dropdown
    } else {
      el.value = "";
    }
  });
}
