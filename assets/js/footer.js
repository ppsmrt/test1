// footer.js
import { getAuth, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();
let loggedIn = false;

// ✅ Inject footer HTML
document.getElementById("footer").innerHTML = `
  <style>
    /* 🔥 Pulse animation for Post button */
    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 99, 132, 0.7); }
      50% { transform: scale(1.1); box-shadow: 0 0 25px rgba(255, 99, 132, 1); }
    }
    .pulse {
      animation: pulseGlow 2s infinite ease-in-out;
    }
    /* Menu Panel */
    #menuPanel {
      transition: transform 0.3s ease-in-out;
    }
    #menuPanel.hidden {
      transform: translateY(100%);
    }
    #menuPanel.visible {
      transform: translateY(0%);
    }
  </style>

  <div class="fixed bottom-0 left-0 w-full flex items-center justify-center gap-10 bg-black/80 py-3 text-white text-xl z-50">

    <!-- Home -->
    <a href="index.html" class="hover:scale-125 transition">
      <i class="fa-solid fa-home"></i>
    </a>

    <!-- Bookmarks -->
    <button id="footerBookmarks" class="hover:scale-125 transition">
      <i class="fa-solid fa-bookmark"></i>
    </button>

    <!-- Post -->
    <button id="footerSubmit" 
      class="pulse text-white text-3xl hover:scale-125 transition relative -mt-8 rounded-full p-4 
      bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 shadow-xl">
      <i class="fa-solid fa-plus"></i>
    </button>

    <!-- Account -->
    <button id="footerAccount" class="hover:scale-125 transition">
      <i class="fa-solid fa-user-circle"></i>
    </button>

    <!-- Menu -->
    <button id="footerMenu" class="hover:scale-125 transition">
      <i class="fa-solid fa-bars"></i>
    </button>
  </div>

  <!-- Menu Panel -->
  <div id="menuPanel" class="fixed bottom-0 left-0 w-full bg-black/95 text-white p-6 hidden">
    <h2 class="text-lg font-bold mb-4">📂 Pages</h2>
    <ul class="space-y-3">
      <li><a href="about.html" class="hover:underline">About Us</a></li>
      <li><a href="contact.html" class="hover:underline">Contact</a></li>
      <li><a href="categories.html" class="hover:underline">Categories</a></li>
      <li><a href="privacy.html" class="hover:underline">Privacy Policy</a></li>
      <li><a href="terms.html" class="hover:underline">Terms & Conditions</a></li>
    </ul>
    <button id="closeMenu" class="mt-6 w-full py-2 bg-red-500 rounded-lg">Close</button>
  </div>

  <!-- Toast -->
  <div id="toast" class="hidden fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm z-50">
    Login Required
  </div>
`;

// ✅ Toast function
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

// ✅ Button actions
document.getElementById("footerBookmarks").addEventListener("click", () => {
  if (!loggedIn) return showToast("Login Required");
  window.location.href = "bookmarks.html";
});

document.getElementById("footerSubmit").addEventListener("click", () => {
  if (!loggedIn) return showToast("Login Required");
  window.location.href = "submit.html";
});

document.getElementById("footerAccount").addEventListener("click", () => {
  if (!loggedIn) {
    window.location.href = "login.html";
  } else {
    if (confirm("Logout from your account?")) {
      signOut(auth);
    }
  }
});

// ✅ Menu Toggle
const menuPanel = document.getElementById("menuPanel");
document.getElementById("footerMenu").addEventListener("click", () => {
  menuPanel.classList.remove("hidden");
  setTimeout(() => menuPanel.classList.add("visible"), 10);
});
document.getElementById("closeMenu").addEventListener("click", () => {
  menuPanel.classList.remove("visible");
  setTimeout(() => menuPanel.classList.add("hidden"), 300);
});

// ✅ Firebase auth listener
onAuthStateChanged(auth, (user) => {
  loggedIn = !!user;
  const accountBtn = document.getElementById("footerAccount");

  if (loggedIn) {
    const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "U")}&background=random&color=fff`;
    accountBtn.innerHTML = `<img src="${photoURL}" class="h-7 w-7 rounded-full border border-white" alt="Profile">`;
  } else {
    accountBtn.innerHTML = `<i class="fa-solid fa-user-circle"></i>`;
  }
});