import { db, getDocs, collection } from './database.js';
import { formatDate } from './utils/formatdate.js'
    formatDate();

// 🔹 DOM elements
const BranchList = document.getElementById("BranchList");
const searchInput = document.getElementById("BranchSearch");
const companySelect = document.getElementById("BranchGroup");
const branchStatus = document.getElementById("BranchStatus");

let allData = [];

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
                  address: u.address || "—",
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
  const statusValue = branchStatus.value.toLowerCase();   // normalize

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



// 🔹 Render users table
function renderTable(data) {
  BranchList.innerHTML = "";

  if (data.length === 0) {
    BranchList.innerHTML = `<tr><td colspan="8" class="text-center">No users found</td></tr>`;
    return;
  }
  
    // Sort by branch name (A–Z)
    data.sort((a, b) => a.name.localeCompare(b.name));
  
    data.forEach(u => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="code">${u.bCode}</td>
        <td>${u.name}</td>
        <td>${u.group}</td>
        <td>${formatDate(u.opendt)}</td>
        <td>${u.phone}</td>
        <td class="company">${u.address}</td>    
        <td>${u.status}</td>
        <td class="action"> <button class="edit-user">✏️</button></td>
        `;
      BranchList.appendChild(row);
    });
  }
  
// 🔹 Add event listener
searchInput.addEventListener("input", applyFilters);
companySelect.addEventListener("change", applyFilters);
branchStatus.addEventListener("change", applyFilters);

// 🔹 Initial load
loadBranches();