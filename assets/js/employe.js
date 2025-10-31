import { db, getDocs, collection } from './database.js';
import { formatDate } from './utils/formatdate.js'
    formatDate();

// 🔹 DOM elements
const employeList = document.getElementById("employeList");
const searchInput = document.getElementById("EmployeeSearch");
const companySelect = document.getElementById("employeGroup");
const employeeStatus = document.getElementById("employeStatus");

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

// 🔹 Apply filters (Search + Group + Status)
function applyFilters() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const groupValue = companySelect.value.toLowerCase();   // normalize
  const statusValue = employeeStatus.value.toLowerCase();   // normalize

  const filtered = allData.filter(r => {
    const name = (r.name || "").toLowerCase();
    const group = (r.company || "").toLowerCase();
    const status = (r.status || "").toLowerCase();

    const matchesSearch = name.includes(searchValue);
    const matchesGroup = groupValue === "all" || group === groupValue;
    const matchesStatus = statusValue === "all" || status === statusValue;

    return matchesSearch && matchesGroup && matchesStatus;
  });

  renderTable(filtered);
}

// 🔹 Render users table
function renderTable(data) {
  employeList.innerHTML = "";

  if (data.length === 0) {
    employeList.innerHTML = `<tr><td colspan="8" class="text-center">No users found</td></tr>`;
    return;
  }

  // Sort by branch name (A–Z)
  data.sort((a, b) => a.branch.localeCompare(b.branch));

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
      <td class="action"> <button class="edit-user" title="View Details">✏️</button></td>
    `;
    employeList.appendChild(row);
  });
}

// 🔹 Add event listener
searchInput.addEventListener("input", applyFilters);
companySelect.addEventListener("change", applyFilters);
employeeStatus.addEventListener("change", applyFilters);

// 🔹 Initial load
loadUsers();
