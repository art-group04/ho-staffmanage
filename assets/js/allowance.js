import { db, collection, getDocs, doc, updateDoc  } from "./database.js";
import { formatDateStamp } from "./utils/formatdate.js";

const btnRequest = document.getElementById("btnRequest");
const btnHistory = document.getElementById("btnHistory");
const TypeTa = document.getElementById("TaType");
const searchInput = document.getElementById("TaSearch");
const HeaderTa = document.getElementById("TaHeader");
const BodyTa = document.getElementById("TaBody");

let allTa = [];
let branchMap = {};
let userMap = {};
let currentPage = "request";

// 🔹 Load Branch Names
async function loadBranchMap() {
  const snap = await getDocs(collection(db, "branches"));
  snap.forEach(docSnap => {
    const data = docSnap.data();
    branchMap[docSnap.id] = data.name || "Unknown Branch";
  });
}

// 🔹 Load User Names
async function loadUserMap() {
  const snap = await getDocs(collection(db, "users"));
  snap.forEach(docSnap => {
    const data = docSnap.data();
    userMap[docSnap.id] = data.user || data.name || "Unknown User";
  });
}

// 🔹 Load TA Files
async function loadTa() {
  BodyTa.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;

  await Promise.all([loadBranchMap(), loadUserMap()]);

  const querySnapshot = await getDocs(collection(db, "ta_files"));

  allTa = querySnapshot.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      ...d,
      username: userMap[d.userId] || "—",
      branchName: branchMap[d.branchId] || "—",
    };
  });

  renderTable();
}

// 🔹 Render Table
function renderTable() {
  let data = [];

  if (currentPage === "request") {
    data = allTa.filter(l => (l.status || "").toLowerCase() === "pending");
    HeaderTa.innerHTML = `
      <tr>
      <th>Date</th>
        <th>Name</th>
        <th>Branch</th>
        <th>TA Number</th>
        <th>Amount</th>        
        <th>Action</th>
      </tr>`;
  } else {
    const typeFilter = TypeTa.value;
    data = allTa.filter(l => {
      const status = (l.status || "").toLowerCase();
      if (typeFilter === "all") return status !== "pending";
      return status === typeFilter;
    });

    HeaderTa.innerHTML = `
      <tr>
      <th>Date</th>
        <th>Name</th>
        <th>Branch</th>
        <th>TA Number</th>
        <th>Amount</th>        
        <th>Status</th>
        <th>Action</th>
      </tr>`;
  }

  // 🔹 Search filter
  const searchTerm = searchInput.value.toLowerCase();
  data = data.filter(l => l.username?.toLowerCase().includes(searchTerm));

  // 🔹 ✅ Sort by Date (latest first)
  data.sort((a, b) => {
    const dateA = a.createdAt?.seconds
      ? new Date(a.createdAt.seconds * 1000)
      : new Date(a.createdAt);
    const dateB = b.createdAt?.seconds
      ? new Date(b.createdAt.seconds * 1000)
      : new Date(b.createdAt);
    return dateA - dateB; // latest first
  });

  if (data.length === 0) {
    BodyTa.innerHTML = `<tr><td colspan="7" class="text-center">No records found</td></tr>`;
    return;
  }

  BodyTa.innerHTML = data
    .map(l => {
      const date = l.createdAt ? formatDateStamp(l.createdAt) : "-";
      return `
        <tr>
        <td>${date}</td>
          <td>${l.username}</td>
          <td>${l.branchName}</td>
          <td>${l.taNumber || "-"}</td>
          <td>${l.totalAmount || "-"}</td>          
          ${
            currentPage === "request"
              ? `<td><button class="view-btn" data-id="${l.id}" title="View / Approve">✏️</button></td>`
              : `<td class="${l.status?.toLowerCase()}">${l.status || "-"}</td>
                 <td><button class="view-btn" data-id="${l.id}" title="View Details">👁️</button></td>`
          }
        </tr>`;
    })
    .join("");

  // 🔹 Button events
  document.querySelectorAll(".view-btn").forEach(btn =>
    btn.addEventListener("click", e => {
      const id = e.target.getAttribute("data-id");
      const record = allTa.find(l => l.id === id);
      if (record) showPopup(record);
    })
  );
}
const popupOverlay = document.getElementById("showPopup");
const popupUser = document.getElementById("user");
const popupBranch = document.getElementById("branch");
const taEntries = document.getElementById("taEntries");
const taStatus = document.getElementById("taStatus");
const updateBtn = document.getElementById("UpdateStatus");
const closeBtn = document.getElementById("closePopup");
const selectInputs =document.getElementById("selectInputs");

async function showPopup(record) {
  // 🔹 Basic info
  popupOverlay.style.display = "flex";
  popupUser.textContent = record.username || "—";
  popupBranch.textContent = record.branchName || "—";

  // 🔹 Entries Table Render
  const entries = record.entries || [];
  if (entries.length === 0) {
    taEntries.innerHTML = `<tr><td colspan="6" class="text-center">No entries found</td></tr>`;
  } else {
    taEntries.innerHTML = entries
      .map(e => {
        const date = e.date ? formatDateStamp(e.date) : "-";
        return `
          <tr>
            <td>${date}</td>
            <td>${e.to || "-"}</td>
            <td>${e.from || "-"}</td>
            <td>${e.mode || "-"}</td>
            <td>${e.km || "-"}</td>
            <td>${e.total || "-"}</td>
          </tr>`;
      })
      .join("");
  }

  // 🔹 Set Current Status
  taStatus.value = record.status || "pending";

  // 🔹 Update Button Handler
  updateBtn.onclick = async () => {
    const newStatus = taStatus.value;
    const docRef = doc(db, "ta_files", record.id);

    try {
      await updateDoc(docRef, { status: newStatus });
      alert(`Status updated to "${newStatus}"`);
      popupOverlay.style.display = "none";
      loadTa(); // refresh table
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update status.");
    }
  };

  // 🔹 Close Popup
  closeBtn.onclick = () => {
    popupOverlay.style.display = "none";
  };
}


btnRequest.addEventListener("click", () => {
  currentPage = "request";
  TypeTa.style.display="none"
  selectInputs.style.display="inline-flex"
  updateBtn.style.display="inline-flex"
  loadTa();
});

btnHistory.addEventListener("click", () => {
  currentPage = "history";
   TypeTa.style.display="inline-flex"
   selectInputs.style.display="none"
   updateBtn.style.display="none"
  loadTa();
});

TypeTa.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

loadTa();
