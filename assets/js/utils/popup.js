const levType = document.getElementById("levType");
  const levTimeBox = document.getElementById("levTimeBox");
  const levToDateBox = document.getElementById("levToDateBox");

  levType.addEventListener("change", () => {
    const value = levType.value;

    // Reset visibility
    levTimeBox.style.display = "none";
    levToDateBox.style.display = "none";

    if (value === "Half") {
      levTimeBox.style.display = "flex";
    } else if (value === "LongLeave") {
      levToDateBox.style.display = "flex";
    }
  });

  // Cancel button to close popup (if needed)
  document.getElementById("CancelAplitn").addEventListener("click", () => {
    document.getElementById("leavePopup").style.display = "none";
  });