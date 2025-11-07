// branchActions.js
import { db, doc, updateDoc, deleteDoc, serverTimestamp } from "./database.js";

export async function updateBranch(branchId, updatedData) {
  try {
    const ref = doc(db, "branches", branchId);
    await updateDoc(ref, {
      ...updatedData,
      updatedAt: serverTimestamp()
    });
    console.log("✅ Branch updated successfully");
  } catch (err) {
    console.error("❌ Error updating branch:", err);
  }
}

export async function deleteBranch(branchId) {
  try {
    const ref = doc(db, "branches", branchId);
    await deleteDoc(ref);
    console.log("🗑️ Branch deleted successfully");
  } catch (err) {
    console.error("❌ Error deleting branch:", err);
  }
}
