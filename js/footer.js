import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();
let loggedIn = false;

document.getElementById("footer").innerHTML = `
  <div class="flex items-center justify-between w-full px-6 py-3 bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 rounded-full shadow-xl text-white text-sm backdrop-blur-lg border border-white/10">
    <!-- Home -->
    <a href="index.html" class="flex flex-col items-center hover:scale-110 transition">
      <i class="fas fa-home mb-1"></i>
      Home
    </a>

    <!-- Bookmarks -->
    <button id="footerBookmarks" class="flex flex-col items-center hover:scale-110 transition">
      <i class="fas fa-bookmark mb-1"></i>
      Bookmarks
    </button>

    <!-- Submit -->
    <button id="footerSubmit" class="flex flex-col items-center hover:scale-110 transition">
      <i class="fas fa-plus mb-1"></i>
      Submit
    </button>

    <!-- Account -->
    <button id="footerAccount" class="flex flex-col items-center hover:scale-110 transition">
      <i class="fas fa-user mb-1"></i>
      Account
    </button>
  </div>
  
  <!-- Mini copyright -->
  <div class="text-xs text-white/70 text-center mt-2">
    <i class="fas fa-leaf text-green-300"></i>
    © ${new Date().getFullYear()} TamilGeo — Explore Knowledge
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

// ✅ Firebase auth listener
onAuthStateChanged(auth, (user) => {
  loggedIn = !!user;
  document.getElementById("footerAccount").innerHTML = `
    <i class="fas fa-user mb-1"></i>
    ${loggedIn ? "Logout" : "Account"}
  `;
});