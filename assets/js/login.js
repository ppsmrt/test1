// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Toast Notification
function showToast(message, type = "error") {
  const toast = document.createElement("div");
  toast.className = `fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white 
                     ${type === "success" ? "bg-green-500" : "bg-red-500"} 
                     animate-slideUp z-50`;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Username/Password login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const loginBtn = document.querySelector("#login-form button[type='submit']");

  // Disable button and show loading state
  loginBtn.disabled = true;
  loginBtn.innerHTML = `<span class="loader"></span> Logging in...`;

  try {
    // Fetch all users
    const usersSnap = await get(ref(db, "users"));
    if (!usersSnap.exists()) {
      showToast("No users found in database.");
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Login";
      return;
    }

    // Find email by username
    let foundEmail = null;
    usersSnap.forEach(childSnap => {
      const userData = childSnap.val();
      if (userData.username && userData.username.toLowerCase() === username.toLowerCase()) {
        foundEmail = userData.email;
      }
    });

    if (!foundEmail) {
      showToast("Username not found!");
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Login";
      return;
    }

    // Login with found email
    const userCredential = await signInWithEmailAndPassword(auth, foundEmail, password);
    const user = userCredential.user;

    await set(ref(db, `users/${user.uid}/lastLogin`), new Date().toISOString());
    showToast("Login successful!", "success");
    setTimeout(() => (window.location.href = "index.html"), 1000);

  } catch (error) {
    showToast(`Login failed: ${error.message}`);
    loginBtn.disabled = false;
    loginBtn.innerHTML = "Login";
  }
});

// Particle background animation
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const numParticles = 60;

for (let i = 0; i < numParticles; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.6,
    dy: (Math.random() - 0.5) * 0.6
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 255, 128, 0.7)";
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Inject Header and Footer if not present
window.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("shared-header")) {
    const header = document.createElement("div");
    header.id = "shared-header";
    document.body.prepend(header);
    import("./header.js"); // Loads your frosted header
  }
  if (!document.getElementById("shared-footer")) {
    const footer = document.createElement("div");
    footer.id = "shared-footer";
    document.body.appendChild(footer);
    import("./footer.js"); // Loads your floating footer
  }
});

// Loader CSS
const loaderStyle = document.createElement("style");
loaderStyle.textContent = `
.loader {
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: inline-block;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}`;
document.head.appendChild(loaderStyle);