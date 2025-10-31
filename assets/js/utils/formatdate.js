//date dd/mm/yyyy format
export function formatDate(dateString) {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// formate date & time--------------------
export function formatDateTime(timestamp) {
  if (!timestamp) return "-";

  let d;

  // ✅ Handle Firestore Timestamp
  if (timestamp.toDate) {
    d = timestamp.toDate();
  } 
  // ✅ Handle Firestore seconds (number)
  else if (timestamp.seconds) {
    d = new Date(timestamp.seconds * 1000);
  } 
  // ✅ Handle string date (already formatted or ISO)
  else if (typeof timestamp === "string" || typeof timestamp === "number") {
    d = new Date(timestamp);
  } 
  // fallback
  else {
    return "-";
  }

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}
