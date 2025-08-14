// footer.js
import { getAuth, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();
let loggedIn = false;

// ✅ Inject footer HTML
document.getElementById("footer").innerHTML = `
  <style>
    /* Frosted Glass Footer */
    .floating-footer {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      background: rgba(30, 30, 30, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
    }
    .floating-footer.hidden-footer {
      transform: translateY(150%);
      opacity: 0;
    }
  </style>

  <div id="floatingFooter" class="floating-footer fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg flex items-center justify-center gap-10 text-white text-xl z-50">

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
      class="text-white text-3xl hover:scale-125 transition relative -mt-8 rounded-full p-4 
      bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 shadow-xl">
      <i class="fa-solid fa-plus"></i>
    </button>

    <!-- Notifications -->
    <button id="footerNotifications" class="hover:scale-125 transition relative">
      <i class="fa-solid fa-bell"></i>
      <span id="notifBadge" class="absolute -top-1 -right-2 bg-red-500 text-xs px-1.5 rounded-full hidden">0</span>
    </button>

    <!-- Account -->
    <button id="footerAccount" class="hover:scale-125 transition">
      <i class="fa-solid fa-user-circle"></i>
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

document.getElementById("footerNotifications").addEventListener("click", () => {
  if (!loggedIn) return showToast("Login Required");
  window.location.href = "notifications.html";
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
    accountBtn.innerHTML = `<i class="fa-solid fa-user-circle"></i>`;
  }
});

// ✅ Hide footer while scrolling
let scrollTimeout;
let lastScrollTop = 0;
const footer = document.getElementById("floatingFooter");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;

  if (scrollTop > lastScrollTop) {
    footer.classList.add("hidden-footer");
  } else {
    footer.classList.remove("hidden-footer");
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    footer.classList.remove("hidden-footer");
  }, 400);
});