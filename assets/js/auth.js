  import { db, collection, getDocs, query, where, updateDoc, doc } from './database.js';

  const statusBox = document.getElementById("status-mssg");

  
  document.getElementById("signInBtn").onclick = async () => {
    const username = email.value.trim();
    const password = pass.value.trim();

    if (!username || !password) {
      statusBox.textContent = "Enter username and password"; 
      return;
    } 

    const q = query(collection(db, 'housers'), where('username', '==', username));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      statusBox.textContent ="User not found";
      return;
    }

    const docSnap = snapshot.docs[0];
    const user = docSnap.data();

   if (user.password !== password) {
    statusBox.textContent = "Incorrect password";
    return;
}

    localStorage.setItem("loggedUser", JSON.stringify({ id: docSnap.id, ...user }));
    window.location.href = "./home"; // redirect
  };