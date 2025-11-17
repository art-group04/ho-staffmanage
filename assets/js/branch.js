import { db, getDocs, collection, doc, updateDoc } from './database.js';
import { formatDate } from './utils/formatdate.js';
formatDate();

// 🔹 DOM elements
const BranchList = document.getElementById("BranchList");
const searchInput = document.getElementById("BranchSearch");
const companySelect = document.getElementById("BranchGroup");
const branchStatus = document.getElementById("BranchStatus");

// 🔹 Popup elements
const popup = document.getElementById("updateBranchPopup");
const updateBtn = document.getElementById("updateDtl");
const cancelBtn = document.getElementById("cancelDtlUp");

// input fields inside popup
const bCodeUp = document.getElementById("bCodeUp");
const opnDtUp = document.getElementById("opnDtUp");
const branchNameUp = document.getElementById("branchNameUp");
const companyInUp = document.getElementById("companyInUp");
const phoneInUp = document.getElementById("phoneInUp");
const emailInUp = document.getElementById("emailInUp");
const addressInUp = document.getElementById("addressInUp");

let allData = [];
let editId = null; // 🔹 currently editing branch id

// 🔹 Load all users & branch names
async function loadBranches() {
  BranchList.innerHTML = "<tr><td colspan='8' class='text-center'>Loading...</td></tr>";

  try {
    const branchSnap = await getDocs(collection(db, "branches"));
    allData = [];
    branchSnap.forEach(docSnap => {
      const u = docSnap.data();
      allData.push({
        id: docSnap.id,
        bCode: u.bCode || "—",
        name: u.name || "—",
        group: u.group || "—",
        opendt: u.opendt || "-",
        phone: u.phone || "—",
        email: u.email || "",
        address: u.address || "—",
        status: u.status || "-"
      });
    });
    applyFilters();
  } catch (error) {
    console.error("❌ Error loading users:", error);
    BranchList.innerHTML = `<tr><td colspan='8' class='text-center text-red-500'>Error loading data</td></tr>`;
  }
}

// 🔹 Apply filters
function applyFilters() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const groupValue = companySelect.value.toLowerCase();
  const statusValue = branchStatus.value.toLowerCase();

  const filtered = allData.filter(u => {
    const name = (u.name || "").toLowerCase();
    const group = (u.group || "").toLowerCase();
    const status = (u.status || "").toLowerCase();
    const matchesSearch = name.includes(searchValue);
    const matchesGroup = groupValue === "all" || group === groupValue;
    const matchesStatus = statusValue === "all" || status === statusValue;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  renderTable(filtered);
}

// 🔹 Render table
function renderTable(data) {
  BranchList.innerHTML = "";

  if (data.length === 0) {
    BranchList.innerHTML = `<tr><td colspan="8" class="text-center">No users found</td></tr>`;
    return;
  }

  data.sort((a, b) => a.name.localeCompare(b.name));

  data.forEach(u => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="code">${u.bCode}</td>
      <td>${u.name}</td>
      <td>${u.group}</td>
      <td>${formatDate(u.opendt)}</td>
      <td>${u.phone}</td>
      <td>${u.address}</td>
      <td>${u.status}</td>
      <td class="action">
        <button class="edit-user" data-id="${u.id}">✏️</button>
      </td>
    `;
    BranchList.appendChild(row);
  });

  // 🔹 Attach edit click listeners
  document.querySelectorAll(".edit-user").forEach(btn => {
    btn.addEventListener("click", () => openEditPopup(btn.dataset.id));
  });
}

// 🔹 Open popup & load selected branch data
function openEditPopup(id) {
  const branch = allData.find(b => b.id === id);
  if (!branch) return;

  editId = id;
  bCodeUp.value = branch.bCode;
  opnDtUp.value = branch.opendt !== "-" ? branch.opendt : "";
  branchNameUp.value = branch.name;
  companyInUp.value = branch.group;
  phoneInUp.value = branch.phone;
  emailInUp.value = branch.email;
  addressInUp.value = branch.address;

  popup.style.display = "flex"; // show popup
}

// 🔹 Cancel button
cancelBtn.addEventListener("click", () => {
  popup.style.display = "none";
  editId = null;
});

// 🔹 Update button
updateBtn.addEventListener("click", async () => {
  if (!editId) return;

  const updatedData = {
    bCode: bCodeUp.value.trim(),
    opendt: opnDtUp.value,
    name: branchNameUp.value.trim(),
    group: companyInUp.value,
    phone: phoneInUp.value.trim(),
    email: emailInUp.value.trim(),
    address: addressInUp.value.trim()
  };

  try {
    const docRef = doc(db, "branches", editId);
    await updateDoc(docRef, updatedData);

    alert("✅ Branch details updated successfully!");
    popup.style.display = "none";
    loadBranches(); // reload list
  } catch (err) {
    console.error("Error updating branch:", err);
    alert("❌ Failed to update branch details");
  }
});

// 🔹 Filters
searchInput.addEventListener("input", applyFilters);
companySelect.addEventListener("change", applyFilters);
branchStatus.addEventListener("change", applyFilters);

// 🔹 Initial load
loadBranches();
 