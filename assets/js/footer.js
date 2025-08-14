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
  </style>

  <div class="flex items-center justify-center gap-10 text-white text-xl z-50">

    <!-- Home -->
    <a href="index.html" class="hover:scale-125 transition">
      <i class="fa fa-home"></i>
    </a>

    <!-- Bookmarks -->
    <button id="footerBookmarks" class="hover:scale-125 transition">
      <i class="fa fa-bookmark"></i>
    </button>

    <!-- Post (center, big, gradient, pulse) -->
    <button id="footerSubmit" 
      class="pulse text-white text-3xl hover:scale-125 transition relative -mt-6 rounded-full p-4 
      bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 shadow-xl">
      <i class="fa fa-plus"></i>
    </button>

    <!-- Account -->
    <button id="footerAccount" class="hover:scale-125 transition">
      <i class="fa fa-user-circle"></i>
    </button>
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
  const accountBtn = document.getElementById("footerAccount");

  if (loggedIn) {
    const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "U")}&background=random&color=fff`;
    accountBtn.innerHTML = `<img src="${photoURL}" class="h-7 w-7 rounded-full border border-white" alt="Profile">`;
  } else {
    accountBtn.innerHTML = `<i class="fa fa-user-circle"></i>`;
  }
});