// Glassmorphic Premium Header
document.getElementById("shared-header").innerHTML = `
  <header class="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
      <a href="index.html" class="flex items-center gap-2 text-2xl font-bold text-green-300 hover:text-teal-300 transition">
        <i class="fas fa-leaf"></i> TamilGeo
      </a>
      <nav class="hidden md:flex gap-6 text-white/80">
        <a href="index.html" class="hover:text-green-300 transition">Home</a>
        <a href="#" class="hover:text-green-300 transition">Categories</a>
        <a href="#" class="hover:text-green-300 transition">About</a>
      </nav>
      <div class="flex items-center gap-4">
        <button id="loginBtn" class="px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition">Login</button>
        <button id="logoutBtn" class="hidden text-red-500 hover:text-red-700 transition" title="Sign Out">
          <i class="fas fa-sign-out-alt text-2xl"></i>
        </button>
      </div>
    </div>
  </header>
`;

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle Auth State
onAuthStateChanged(auth, (user) => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }
});

// Logout handler with redirect
document.addEventListener("click", (e) => {
  if (e.target.closest("#logoutBtn")) {
    signOut(auth)
      .then(() => {
        window.location.href = "index.html"; // Redirect after logout
      })
      .catch(err => console.error("Logout error:", err));
  }
});

// Login button click redirect
document.addEventListener("click", (e) => {
  if (e.target.closest("#loginBtn")) {
    window.location.href = "login.html";
  }
});