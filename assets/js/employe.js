import { db, getDocs, getDoc, doc, collection, updateDoc } from './database.js';
import { formatDate } from './utils/formatdate.js';
import { loadBranches } from "./utils/branchUtils.js";


// 🔹 Initialize branch data
async function init() {
  allData = await loadBranches();
}

// 🔹 Call on page load
init();
formatDate();

// 🔹 Populate branch dropdown
async function populateBranchDropdown() {
  const branches = await loadBranches();

  // 🔹 Sort branches alphabetically by name
  branches.sort((a, b) => a.name.localeCompare(b.name));

  const dropdown = document.getElementById("branchOut");
  dropdown.innerHTML = `<option value="" disabled selected>Select Branch</option>`;

  branches.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.name;
    dropdown.appendChild(opt);
  });
}

// 🔹 DOM elements
const employeList = document.getElementById("employeList");
const searchInput = document.getElementById("EmployeeSearch");
const companySelect = document.getElementById("employeGroup");
const employeeStatus = document.getElementById("employeStatus");
const employeeCatagory = document.getElementById("eCatagory");

let allData = [];

// 🔹 Load all users & branch names
async function loadUsers() {
  employeList.innerHTML = "<tr><td colspan='8' class='text-center'>Loading...</td></tr>";

  try {
    // 🔸 Step 1: Get all branches
    const branchSnap = await getDocs(collection(db, "branches"));
    const branchMap = {};
    branchSnap.forEach(b => {
      const data = b.data();
      branchMap[b.id] = data.branchName || data.name || "Unknown Branch";
    });

    // 🔸 Step 2: Get all users
    const userSnap = await getDocs(collection(db, "users"));
    allData = [];

    userSnap.forEach(docSnap => {
      const u = docSnap.data();
      allData.push({
        id: docSnap.id,
        eCode: u.eCode || "—",
        name: u.user || "—",
        company: u.company || "—",
        branch: branchMap[u.branchId] || "—",
        designation: u.designation || "—",
        jDate: u.jDate || "—",
        status: u.status || "-"
      });
    });

    applyFilters();
  } catch (error) {
    console.error("❌ Error loading users:", error);
    employeList.innerHTML = `<tr><td colspan='8' class='text-center text-red-500'>Error loading data</td></tr>`;
  }
}

// 🔹 Apply filters
function applyFilters() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const groupValue = companySelect.value.toLowerCase();
  const statusValue = employeeStatus.value.toLowerCase();
  const catagoryValue = eCatagory.value.toLowerCase(); 

  const filtered = allData.filter(r => {
    const name = (r.name || "").toLowerCase();
    const group = (r.company || "").toLowerCase();
    const status = (r.status || "").toLowerCase();
    const branch = (r.branch || "").toLowerCase();

    const matchesSearch = name.includes(searchValue);
    const matchesGroup = groupValue === "all" || group === groupValue;
    const matchesStatus = statusValue === "all" || status === statusValue;

    // ✅ branch filter 
    let catagory = true;
    if (catagoryValue === "headoffice") {
      catagory = branch === "headoffice";
    } else if (catagoryValue === "branch") {
      catagory = branch !== "headoffice";
    } else if (catagoryValue === "all") {
      catagory = true;
    }

    return (
      matchesSearch &&
      matchesGroup &&
      matchesStatus &&
      catagory
    );
  });

  renderTable(filtered);
}


// 🔹 Personal popup (View Only)
const detailPopup = document.getElementById("presonaldetailPopup");
const closeDtlBtn = document.getElementById("closeDtl");

const stafName = document.getElementById("stafNameout");
const dobIn = document.getElementById("dobout");
const mobileIn = document.getElementById("mobileout");
const addressIn = document.getElementById("addressout");
const iddetailsIn = document.getElementById("iddetailsout");
const bankIn = document.getElementById("bankout");
const banknumIn = document.getElementById("banknumout");

async function openEmployeeDetail(empId) {
  try {
    const userDoc = await getDoc(doc(db, "users", empId));
    if (!userDoc.exists()) return alert("User not found!");

    const emp = userDoc.data();

    stafName.value = emp.user || emp.name || "";
    dobIn.value = emp.dob || "";
    mobileIn.value = emp.mobile || "";
    addressIn.value = emp.address || "";
    iddetailsIn.value = emp.aadhaar || "";
    bankIn.value = emp.bank || "";
    banknumIn.value = emp.banknum || "";

    [stafName, dobIn, mobileIn, addressIn, iddetailsIn, bankIn, banknumIn].forEach(inp => {
      inp.readOnly = true;
      inp.disabled = true;
    });

    detailPopup.style.display = "flex";
  } catch (err) {
    console.error("Error loading personal detail:", err);
  }
}


closeDtlBtn.addEventListener("click", () => {
  detailPopup.style.display = "none";
});

// 🔹 Company Detail Popup elements
const companyPopup = document.getElementById("companydetailPopup");
const cancelComp = document.getElementById("cancelComp");
const updateComp = document.getElementById("UpdateComp");

const eCodeOut = document.getElementById("eCodeOut");
const jDateOut = document.getElementById("jDateOut");
const NameOut = document.getElementById("NameOut");
const companyOut = document.getElementById("companyOut");
const branchOut = document.getElementById("branchOut");
const designationOut = document.getElementById("designationOut");
const statusOut = document.getElementById("statusOut");

let selectedUserId = null;

// 🔹 Open company popup with editable employee data
async function openCompanyDetail(empId) {
  try {
    const userDoc = await getDoc(doc(db, "users", empId));
    if (!userDoc.exists()) return alert("User not found!");

    const emp = userDoc.data();
    selectedUserId = empId;

    eCodeOut.value = emp.eCode || "";
    jDateOut.value = emp.jDate || "";
    NameOut.value = emp.user || emp.name || "";
    companyOut.value = emp.company || "chengannur nidhi limited";
    branchOut.value = emp.branchId || "";
    designationOut.value = emp.designation || "";
    statusOut.value = emp.status || "active";

    companyPopup.style.display = "flex";
    
  } catch (err) {
    console.error("Error opening company popup:", err);
  }
}

// 🔹 Close popup
cancelComp.addEventListener("click", () => {
  companyPopup.style.display = "none";
  selectedUserId = null;
});

// 🔹 Update employee details
updateComp.addEventListener("click", async () => {
  if (!selectedUserId) return alert("No employee selected!");

  try {
    const userRef = doc(db, "users", selectedUserId);
    await updateDoc(userRef, {
      eCode: eCodeOut.value.trim(),
      jDate: jDateOut.value,
      user: NameOut.value.trim(),
      company: companyOut.value,
      branchId: branchOut.value,
      designation: designationOut.value,
      status: statusOut.value,
    });

    alert("✅ Employee details updated!");
    companyPopup.style.display = "none";
    loadUsers(); // refresh
  } catch (err) {
    console.error("Error updating employee:", err);
    alert("❌ Update failed.");
  }
});

// 🔹 Render users table
function renderTable(data) {
  employeList.innerHTML = "";

  if (data.length === 0) {
    employeList.innerHTML = `<tr><td colspan="8" class="text-center">No users found</td></tr>`;
    return;
  }

 data.sort((a, b) => Number(a.eCode) - Number(b.eCode));
  data.forEach(u => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="code">${u.eCode}</td>
      <td>${u.name}</td>
      <td class="company">${u.company}</td>
      <td>${u.branch}</td>
      <td>${u.designation}</td>
      <td>${formatDate(u.jDate)}</td>
      <td>${u.status}</td>
      <td class="action"> 
        <button class="view-user" title="View Personal Details">....</button>
        <button class="edit-user" title="Update Company Details">✏️</button>
        <button class="edit-user" title="Salary Details">🪙</button>
      </td>
    `;
    employeList.appendChild(row);

    // 👁️ View Personal Detail
  row.querySelector(".view-user").addEventListener("click", async () => {
  openEmployeeDetail(u.id);
});


    // ✏️ Update Company Detail
    row.querySelector(".edit-user[title='Update Company Details']").addEventListener("click", () => {
      openCompanyDetail(u.id);
    });
  });
}

// 🔹 Filters listener
searchInput.addEventListener("input", applyFilters);
companySelect.addEventListener("change", applyFilters);
employeeStatus.addEventListener("change", applyFilters);
eCatagory.addEventListener("change", applyFilters);

// 🔹 Initial load
// 🔹 Initial load
loadUsers();
populateBranchDropdown();

