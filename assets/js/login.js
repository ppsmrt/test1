// ✅ Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Login Handling
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("⚠️ Please fill in all fields!");
    return;
  }

  try {
    const snapshot = await get(child(ref(db), "users/" + username));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.password === password) {
        // ✅ Store in localStorage
        localStorage.setItem("username", username);
        localStorage.setItem("role", userData.role || "user");

        alert("✅ Login Successful! Welcome " + username);
        window.location.href = "dashboard.html"; // redirect
      } else {
        alert("❌ Wrong password!");
      }
    } else {
      alert("❌ User not found!");
    }
  } catch (error) {
    console.error(error);
    alert("⚠️ Error logging in. Try again later.");
  }
});