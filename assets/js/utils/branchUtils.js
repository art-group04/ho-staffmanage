import { db, collection, getDocs } from "../database.js";

export async function loadBranches() {
  const branchList = [];

  try {
    const branchSnap = await getDocs(collection(db, "branches"));
    branchSnap.forEach(docSnap => {
      const u = docSnap.data();
      branchList.push({
        id: docSnap.id,
        bCode: u.bCode || "—",
        name: u.name || "—",
        group: u.group || u.companyIn || "—",
        opendt: u.opendt || u.opnDt || "—",
        phone: u.phone || u.phoneIn || "—",
        address: u.address || u.addressIn || "—",
        status: u.status || "—",
      });
    });

    return branchList;
  } catch (err) {
    console.error("❌ Error loading branches:", err);
    return [];
  }
}
