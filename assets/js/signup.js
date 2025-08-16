// ✅ Firebase Signup Script

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// ✅ Your Firebase Config (replace with your credentials)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Signup Form Handler
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  if (!username || !password || !confirmPassword) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("❌ Passwords do not match!");
    return;
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "users/" + username));

    if (snapshot.exists()) {
      alert("⚠️ Username already taken! Please choose another.");
    } else {
      await set(ref(db, "users/" + username), {
        password: password
      });
      alert("✅ Account created successfully! Please login.");
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error(error);
    alert("❌ Error creating account. Try again later.");
  }
});