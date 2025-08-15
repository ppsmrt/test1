// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
const provider = new GoogleAuthProvider();

// Username/Password login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    // Step 1: Find the email for the username
    const usersSnap = await get(ref(db, "users"));
    let foundEmail = null;
    usersSnap.forEach(childSnap => {
      const userData = childSnap.val();
      if (userData.username && userData.username.toLowerCase() === username.toLowerCase()) {
        foundEmail = userData.email;
      }
    });

    if (!foundEmail) {
      alert("Username not found!");
      return;
    }

    // Step 2: Login with the found email
    const userCredential = await signInWithEmailAndPassword(auth, foundEmail, password);
    const user = userCredential.user;

    await set(ref(db, `users/${user.uid}/lastLogin`), new Date().toISOString());
    alert("Login successful!");
    window.location.href = "index.html";
  } catch (error) {
    alert(`Login failed: ${error.message}`);
  }
});

// Google Sign-In (still email-based, but can store username too)
document.getElementById("google-login").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await set(ref(db, `users/${user.uid}`), {
      username: user.displayName.replace(/\s+/g, '').toLowerCase(),
      name: user.displayName,
      email: user.email,
      lastLogin: new Date().toISOString()
    });

    alert(`Welcome ${user.displayName}!`);
    window.location.href = "index.html";
  } catch (error) {
    alert(`Google login failed: ${error.message}`);
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