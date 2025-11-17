import { db, collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "./database.js";
import { updateBranch, deleteBranch } from "./branchActions.js";
import { formatDateTime } from "./utils/formatdate.js";

// 🔹 DOM Elements
const settingsHeader = document.getElementById("settingsHeader");
const settingsBody = document.getElementById("settingsBody");
const pageTitle = document.getElementById("pageTitle");
const btnUser = document.getElementById("btnUser");
const btnBranch = document.getElementById("btnBranch");
const btnhoUser = document.getElementById("btnhoUser");

const searchInput = document.getElementById("SettingSearch");
const branchSettPopup = document.getElementById("branchSettPopup");
const userSettPopup = document.getElementById("userSettPopup");

const updateBranchBtn = document.getElementById("updateBranchBtn");
const deleteBranchBtn = document.getElementById("deleteBranchBtn");
const updateUserBtn = document.getElementById("updateUserBtn");
const deleteUserBtn = document.getElementById("deleteUserBtn"); 

const cancelBranch = document.getElementById("cancelBranch");
const cancelUser = document.getElementById("cancelUser");

// 🔹 Global Variables
let allUsers = [];
let allBranches = [];
let allhousers = [];
let currentBranchId = null;
let currentUserId = null;
let currentView = "user";

// --------------------------------
// 🔹 Load Branches
async function loadBranches() {
  const branchSnap = await getDocs(collection(db, "branches"));
  const branches = [];
  branchSnap.forEach(docSnap => {
    const d = docSnap.data();
    branches.push({
      id: docSnap.id,
      code: d.bCode || "—",
      branch: d.name || "—",
      group: d.group || "—",
      lat: d.lat || "-",
      lng: d.lng || "-",
      radius: d.radius_m || "-",
      status: d.status || "Active",
      updated: d.updatedAt || "—",
    });
  });
  return branches;
}

// 🔹 Load Users
async function loadUsers() {
  const userSnap = await getDocs(collection(db, "users"));
  const users = [];
  userSnap.forEach(docSnap => {
    const d = docSnap.data();
    users.push({
      id: docSnap.id,
      code: d.eCode || "-",
      name: d.user || "—",
      username: d.username || "—",
      device: d.deviceId || "—",
      updated: d.updatedAt || "—",
    });
  });
  return users;
}

// 🔹 Load ho Users
async function loadHoUsers() {
  const userSnap = await getDocs(collection(db, "housers"));
  const users = [];
  userSnap.forEach(docSnap => {
    const d = docSnap.data();
    users.push({
      id: docSnap.id,      
      name: d.user || "—",
      username: d.username || "—",      
      role: d.role || "—",
    });
  });
  return users;
}

// --------------------------------
// 🔹 Render Table
function renderTable(type, data) {
  settingsHeader.innerHTML = "";
  settingsBody.innerHTML = "";

  if (type === "branch") {
    pageTitle.textContent = "Branch Settings";
    settingsHeader.innerHTML = `
      <tr>
        <th>Code</th>
        <th>Branch</th>
        <th>Lat</th>
        <th>Lng</th>
        <th>Radius(m)</th>
        <th>Status</th>
        <th>Last Update</th>
        <th>Action</th>
      </tr>
    `;

    data.forEach(b => {
      const tr = document.createElement("tr");
      tr.dataset.id = b.id;
      tr.innerHTML = `
        <td class="code">${b.code}</td>
        <td>${b.branch}</td>
        <td>${b.lat}</td>
        <td>${b.lng}</td>
        <td>${b.radius}</td>
        <td>${b.status}</td>
        <td>${formatDateTime(b.updated)}</td>
        <td><button class="edit-btn">✏️</button></td>
      `;
      settingsBody.appendChild(tr);
    });
  }

  if (type === "user") {
    pageTitle.textContent = "User Settings";
    settingsHeader.innerHTML = `
      <tr>
        <th>Code</th>
        <th>Name</th>
        <th>Username</th>
        <th>Device</th>
        <th>Last Update</th>
        <th>Action</th>
      </tr>
    `;
    
    data.forEach(u => {
      const tr = document.createElement("tr");
      tr.dataset.id = u.id;
      tr.innerHTML = `
        <td>${u.code}</td>
        <td>${u.name}</td>
        <td>${u.username}</td>
        <td>${u.device}</td>
        <td>${formatDateTime(u.updated)}</td>
        <td>
          <button class="edit-user">✏️</button>
          <button class="reset-device">Reset Device</button>
        </td>
      `;
      settingsBody.appendChild(tr);
    });
  }

  if (type === "houser") {
    pageTitle.textContent = "Ho User Settings";
    settingsHeader.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Username</th>
        <th>Role</th>
        <th>Action</th>
      </tr>
    `;

    data.forEach(h => {
      const tr = document.createElement("tr");
      tr.dataset.id = h.id;
      tr.innerHTML = `
        <td>${h.name}</td>
        <td>${h.username}</td>
        <td>${h.role}</td>
        <td>
          <button class="edit-user">✏️</button>
        </td>
      `;
      settingsBody.appendChild(tr);
    });
  }
}

// --------------------------------
// 🔹 Open Branch Popup
function openBranchPopup(id) {
  const selected = allBranches.find(b => b.id === id);
  if (!selected) return;

  currentBranchId = selected.id;
  document.getElementById("bCode").textContent = selected.code;
  document.getElementById("name").textContent = selected.branch;
  document.getElementById("group").textContent = selected.group || "-";
  document.getElementById("statusText").textContent = selected.status || "Active";

  document.getElementById("latIn").value = selected.lat || "";
  document.getElementById("lngIn").value = selected.lng || "";
  document.getElementById("radius").value = selected.radius || "";
  document.getElementById("statusIn").value = selected.status.toLowerCase();

  branchSettPopup.style.display = "flex";
}

// 🔹 Open User Popup
function openUserPopup(id) {
  const selected = allUsers.find(u => u.id === id);
  if (!selected) return;

  currentUserId = selected.id;
  document.getElementById("eCode").textContent = selected.code;
  document.getElementById("user").textContent = selected.name;
  document.getElementById("username").textContent = selected.username;

  document.getElementById("usernameIn").value = selected.username || "";
  document.getElementById("passwordIn").value = "";

  userSettPopup.style.display = "flex";
}

// --------------------------------
// 🔹 Event Listeners
btnUser.addEventListener("click", async () => {
  currentView = "user";
  allUsers = await loadUsers();
  renderTable("user", allUsers);
  searchInput.oninput = () => applySearch("user");

  document.getElementById("addHoUser").style.display = "none";
});

btnBranch.addEventListener("click", async () => {
  currentView = "branch";
  allBranches = await loadBranches();
  renderTable("branch", allBranches);
  searchInput.oninput = () => applySearch("branch");

  document.getElementById("addHoUser").style.display = "none";
});

btnhoUser.addEventListener("click", async () => {
  currentView = "houser";
  allhousers = await loadHoUsers();
  renderTable("houser", allhousers);
  searchInput.oninput = () => applySearch("houser");

  // ✅ "Add User" enable 
  const addUserBtn = document.getElementById("addHoUser");
  addUserBtn.style.display = "block";

  // ✅ Add User 
  addHoUser.onclick = () => {
    const hoUserPopup = document.getElementById("hoUserPopup");
    if (hoUserPopup) {
      hoUserPopup.style.display = "flex";
    } else {
      console.warn("⚠️ hoUserPopup not found in DOM.");
    }
  };
});


// 🔹 Table Buttons
settingsBody.addEventListener("click", async (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.dataset.id;

  if (e.target.classList.contains("edit-btn")) {
    openBranchPopup(id);
  }

  if (e.target.classList.contains("edit-user")) {
    openUserPopup(id);
  }

  if (e.target.classList.contains("reset-device")) {
    if (confirm("Reset this user's device ID?")) {
      await updateDoc(doc(db, "users", id), {
        deviceId: null,
        updatedAt: serverTimestamp(),
      });
      alert("✅ Device ID reset successful!");
      allUsers = await loadUsers();
      renderTable("user", allUsers);
    }
  }
});

// 🟢 Update Branch
updateBranchBtn.addEventListener("click", async () => {
  if (!currentBranchId) return;
  const updatedData = {
    lat: document.getElementById("latIn").value,
    lng: document.getElementById("lngIn").value,
    radius_m: document.getElementById("radius").value,
    status: document.getElementById("statusIn").value,
    updatedAt: serverTimestamp(),
  };
  await updateBranch(currentBranchId, updatedData);
  branchSettPopup.style.display = "none";
  allBranches = await loadBranches();
  renderTable("branch", allBranches);
});

// 🟢 Delete Branch
deleteBranchBtn.addEventListener("click", async () => {
  if (!currentBranchId) return;
  if (confirm("Are you sure you want to delete this branch?")) {
    await deleteBranch(currentBranchId);
    alert("🗑️ Branch deleted successfully!");
    branchSettPopup.style.display = "none";
    allBranches = await loadBranches();
    renderTable("branch", allBranches);
  }
});

// 🟢 Update User
updateUserBtn.addEventListener("click", async () => {
  if (!currentUserId) return;
  const updatedUsername = document.getElementById("usernameIn").value;
  const updatedPassword = document.getElementById("passwordIn").value;
  const updateObj = {
    username: updatedUsername,
    updatedAt: serverTimestamp(),
  };
  if (updatedPassword.trim() !== "") updateObj.password = updatedPassword;

  await updateDoc(doc(db, "users", currentUserId), updateObj);
  alert("✅ User details updated successfully!");
  userSettPopup.style.display = "none";
  allUsers = await loadUsers();
  renderTable("user", allUsers);
});

// 🟢 Delete User
deleteUserBtn.addEventListener("click", async () => {
  if (!currentUserId) return;
  if (confirm("Are you sure you want to delete this user?")) {
    await deleteDoc(doc(db, "users", currentUserId));
    alert("🗑️ User deleted successfully!");
    userSettPopup.style.display = "none";
    allUsers = await loadUsers();
    renderTable("user", allUsers);
  }
});

// Close popup
cancelBranch.addEventListener("click", () => {
  branchSettPopup.style.display = "none";
});

cancelUser.addEventListener("click", () => {
  userSettPopup.style.display = "none";
});

// 🔹 Default Load 
(async function init() {
  allUsers = await loadUsers();
  renderTable("user", allUsers);
  searchInput.oninput = () => applySearch("user");
})();


function applySearch(type) {
  const term = searchInput.value.toLowerCase();

  let filtered = [];

  if (type === "user") {
    filtered = allUsers.filter(u =>
      u.code.toLowerCase().includes(term) ||
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.device.toLowerCase().includes(term)
    );
  }

  if (type === "branch") {
    filtered = allBranches.filter(b =>
      b.code.toLowerCase().includes(term) ||
      b.branch.toLowerCase().includes(term) ||
      b.lat.toLowerCase().includes(term) ||
      b.lng.toLowerCase().includes(term) ||
      b.status.toLowerCase().includes(term)
    );
  }

  if (type === "houser") {
    filtered = allhousers.filter(h =>
      h.name.toLowerCase().includes(term) ||
      h.username.toLowerCase().includes(term) ||
      h.role.toLowerCase().includes(term)
    );
  }

  renderTable(type, filtered);
}
