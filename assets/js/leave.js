import { db, collection, query, where, getDocs, doc, updateDoc } from "./database.js";
import { formatDate } from "./utils/formatdate.js";

// 🔹 DOM Elements
const btnRequest = document.getElementById("btnRequest");
const btnHistory = document.getElementById("btnHistory");
const leaveType = document.getElementById("leaveType");
const searchInput = document.getElementById("leaveSearch");
const leavesHeader = document.getElementById("leavesHeader");
const leaveBody = document.getElementById("leaveBody");

const popup = document.getElementById("newLeavePopup");
const popupContent = document.getElementById("LeavePopupContent");
const popupClose = document.getElementById("closePopup");
const popupSave = document.getElementById("leavesave");

// popup input fields
const popupStatus = document.getElementById("status");
const popupLeaveType = document.getElementById("leaveType");
const popupRemarks = document.getElementById("remarks");

let allLeaves = [];
let branchMap = {};
let currentPage = "request";
let selectedLeaveId = null; // 🔹 store the selected record ID

// 🔹 Load branch names
async function loadBranchMap() {
  const snap = await getDocs(collection(db, "branches"));
  snap.forEach(docSnap => {
    const data = docSnap.data();
    branchMap[docSnap.id] = data.name || "Unknown Branch";
  });
}

// 🔹 Load leave requests
async function loadLeaves() {
  leaveBody.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;
  await loadBranchMap();
  const querySnapshot = await getDocs(collection(db, "leaveRequests"));
  allLeaves = querySnapshot.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      ...d,
      branchName: branchMap[d.branchId] || "—",
    };
  });
  renderTable();
}

// 🔹 Render Table
function renderTable() {
  let data = [];

  if (currentPage === "request") {
    data = allLeaves.filter(l => (l.status || "").toLowerCase() === "pending");
    leavesHeader.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Branch</th>
        <th>Type</th>
        <th>Section</th>
        <th>Leave Date</th>
        <th>Action</th>
      </tr>`;
  } else {
    const typeFilter = leaveType.value;
    data = allLeaves.filter(l => {
      const status = l.status?.toLowerCase();
      if (typeFilter === "all") return status !== "pending";
      return status === typeFilter;
    });

    leavesHeader.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Branch</th>
        <th>Type</th>
        <th>Section</th>
        <th>Leave Date</th>
        <th>Status</th>
        <th>Action</th>
      </tr>`;
  }

  const searchTerm = searchInput.value.toLowerCase();
  data = data.filter(l => l.username?.toLowerCase().includes(searchTerm));

  if (data.length === 0) {
    leaveBody.innerHTML = `<tr><td colspan="7" class="text-center">No records found</td></tr>`;
    return;
  }

  leaveBody.innerHTML = data
    .map(l => `
      <tr>
        <td>${l.username || "-"}</td>
        <td>${l.branchName}</td>
        <td>${l.leaveDuration || "-"}</td>
        <td>${l.time || "-"}</td>
        <td>${l.fromDate ? formatDate(l.fromDate) : "-"}</td>
        ${
          currentPage === "request"
            ? `<td><button class="view-btn" data-id="${l.id}">✏️</button></td>`
            : `<td class="${l.status?.toLowerCase()}">${l.status}</td>
               <td><button class="view-btn" title="View" data-id="${l.id}">....</button></td>`
        }
      </tr>`)
    .join("");

  document.querySelectorAll(".view-btn").forEach(btn =>
    btn.addEventListener("click", e => {
      const id = e.target.getAttribute("data-id");
      const record = allLeaves.find(l => l.id === id);
      if (record) showPopup(record);
    })
  );
}

// 🔹 Show Popup
function showPopup(data) {
  selectedLeaveId = data.id; // store the selected doc ID

  popupContent.innerHTML = `
  <div class="inputBox">
    <label>Name</label>
    <input type="text" value="${data.username || "-"}" readonly>
  </div>
  <div class="inputBox">
    <label>Branch</label>
    <input type="text" value="${data.branchName}" readonly>
  </div>
  <div class="inputBox">
    <label>Leave Duration</label>
    <input type="text" value="${data.leaveDuration || "-"}" readonly>
  </div>
  <div class="inputBox">
    <label>Section</label>
    <input type="text" value="${data.time || "-"}" readonly>
  </div>
  <div class="inputBox">
    <label>Leave From</label>
    <input type="text" value="${formatDate(data.fromDate) || "-"}" readonly>
  </div>
  <div class="inputBox">
    <label>Leave To</label>
    <input type="text" value="${formatDate(data.toDate) || "-"}" readonly>
  </div>
  <div class="inputBox">
    <label>Reason</label>
    <input type="text" value="${data.reason || "-"}" readonly>
  </div>`;

  // Reset previous inputs
  document.getElementById("statusIn").value = data.status || "";
  document.getElementById("leaveTypeIn").value = data.leaveType || "";
  document.getElementById("remarks").value = data.remarks || "";

  popup.style.display = "flex";
}

// 🔹 Close Popup
popupClose.addEventListener("click", () => {
  popup.style.display = "none";
});

// 🔹 Save Updated Data
popupSave.addEventListener("click", async () => {
  if (!selectedLeaveId) return;

  const newStatus = document.getElementById("statusIn").value;
  const newLeaveType = document.getElementById("leaveTypeIn").value;
  const newRemarks = document.getElementById("remarks").value.trim();

  if (!newStatus) {
    alert("Please select both status and leave type.");
    return;
  }

  try {
    const ref = doc(db, "leaveRequests", selectedLeaveId);
    await updateDoc(ref, {
      status: newStatus,
      leaveType: newLeaveType,
      remarks: newRemarks,
    });

    alert("Leave request updated successfully!");
    popup.style.display = "none";
    loadLeaves(); // reload data
  } catch (err) {
    console.error("Error updating leave:", err);
    alert("Failed to update leave request.");
  }
});

// 🔹 Filters and Buttons
btnRequest.addEventListener("click", () => {
  currentPage = "request";
  popupSave.style.display = "flex";
  leaveType.style.display = "none";
  renderTable();
});

btnHistory.addEventListener("click", () => {
  currentPage = "history";
  popupSave.style.display = "none";
  leaveType.style.display = "inline-block";
  renderTable();    
});

leaveType.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// 🔹 Initial Load
loadLeaves();
