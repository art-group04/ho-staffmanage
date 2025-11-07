import { db, collection, getDocs, query, where } from './database.js';

const statusBox = document.getElementById("status-mssg");
const signInBtn = document.getElementById("signInBtn");
const userNameEl = document.getElementById("userName");
const pass = document.getElementById("pass");

// 🔸 Common login function
async function handleLogin() {
  const username = userNameEl.value.trim();
  const password = pass.value.trim();

  if (!username || !password) {
    statusBox.textContent = "Enter username and password";
    return;
  }

  const q = query(collection(db, 'housers'), where('username', '==', username));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    statusBox.textContent = "User not found";
    return;
  }

  const docSnap = snapshot.docs[0];
  const user = docSnap.data();

  if (user.password !== password) {
    statusBox.textContent = "Incorrect password";
    return;
  }

  localStorage.setItem("loggedUser", JSON.stringify({ id: docSnap.id, ...user }));
  window.location.href = "./home";
}

// 🔹 Click login
signInBtn.addEventListener("click", handleLogin);

// 🔹 Enter key login (from email or password fields)
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleLogin();
  }
});

localStorage.removeItem("loggedUser");