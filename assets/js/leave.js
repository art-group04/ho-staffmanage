import { db, collection, getDocs, doc, getDoc } from "./database.js";
import { formatDate } from "./utils/formatdate.js";
    formatDate();

// 🔹 DOM Elements
const btnRequest = document.getElementById("btnRequest");
const btnHistory = document.getElementById("btnHistory");
const leaveType = document.getElementById("leaveType");
const searchInput = document.getElementById("leaveSearch");
const leavesHeader = document.getElementById("leavesHeader");
const leaveBody = document.getElementById("leaveBody");

const popup = document.getElementById("LeavePopup");
const popupContent = document.getElementById("LeavePopupContent");
const popupClose = document.getElementById("closePopup");

let allLeaves = [];
let branchMap = {};
let currentPage = "request"; // "request" or "history"

// 🔹 Load all branches once and map by ID
async function loadBranchMap() {
  const snap = await getDocs(collection(db, "branches"));
  snap.forEach(docSnap => {
    const data = docSnap.data();
    branchMap[docSnap.id] = data.name || "Unknown Branch";
  });
}

// 🔹 Load leave requests and attach branch name
async function loadLeaves() {
  leaveBody.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;

  await loadBranchMap(); // 🔹 make sure branch names available

  const querySnapshot = await getDocs(collection(db, "leaveapply"));
  allLeaves = querySnapshot.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      ...d,
      branchName: branchMap[d.branchId] || "—", // 🔹 attach readable name
    };
  });

  renderTable();
}

// 🔹 Render Table
function renderTable() {
  let data = [];

  if (currentPage === "request") {
    data = allLeaves.filter(l => l.leaveStatus?.toLowerCase() === "pending");
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
      const status = l.leaveStatus?.toLowerCase();
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
    .map(l => {
      if (currentPage === "request") {
        return `
          <tr>
            <td>${l.username || "-"}</td>
            <td>${l.branchName}</td>
            <td>${l.levType || "-"}</td>
            <td>${l.levTime || "-"}</td>
            <td>${formatDate(l.levDate) || "-"}</td>
            <td><button class="view-btn" data-id="${l.id}">View</button></td>
          </tr>`;
      } else {
        return `
          <tr>
            <td>${l.username || "-"}</td>
            <td>${l.branchName}</td>
            <td>${l.levType || "-"}</td>
            <td>${l.levTime || "-"}</td>
            <td>${formatDate(l.levDate) || "-"}</td>
            <td class="${l.leaveStatus?.toLowerCase()}">${l.leaveStatus}</td>
            <td><button class="view-btn" data-id="${l.id}">View</button></td>
          </tr>`;
      }
    })
    .join("");

  document.querySelectorAll(".view-btn").forEach(btn =>
    btn.addEventListener("click", e => {
      const id = e.target.getAttribute("data-id");
      const record = allLeaves.find(l => l.id === id);
      if (record) showPopup(record);
    })
  );
}

// 🔹 Popup
function showPopup(data) {
  popupContent.innerHTML = `
    <h3>Leave Details</h3>
    <p><strong>Name:</strong> ${data.username || "-"}</p>
    <p><strong>Branch:</strong> ${data.branchName}</p>
    <p><strong>Designation:</strong> ${data.designation || "-"}</p>
    <p><strong>Leave Type:</strong> ${data.levType || "-"}</p>
    <p><strong>Section:</strong> ${data.levTime || "-"}</p>
    <p><strong>From:</strong> ${data.leaveDate || "-"}</p>
    <p><strong>To:</strong> ${data.levToDate || "-"}</p>
    <p><strong>Reason:</strong> ${data.levReason || "-"}</p>
    <p><strong>Status:</strong> ${data.leaveStatus || "-"}</p>
  `;
  popup.style.display = "flex";
}

popupClose.addEventListener("click", () => {
  popup.style.display = "none";
});

// 🔹 Filters and Buttons
btnRequest.addEventListener("click", () => {
  currentPage = "request";
  leaveType.style.display = "none";
  renderTable();
});

btnHistory.addEventListener("click", () => {
  currentPage = "history";
  leaveType.style.display = "inline-block";
  renderTable();
});

leaveType.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// 🔹 Initial Load
loadLeaves();
