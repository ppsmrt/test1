// footer.js
import { getAuth, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();
let loggedIn = false;

document.getElementById("footer").innerHTML = `
  <style>
    /* Frosted Glass Footer */
    .glass-footer {
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      background-color: rgba(17, 25, 40, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.125);
      transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
    }
    .glass-footer.hidden-footer {
      transform: translateY(150%);
      opacity: 0;
    }
  </style>

  <div id="floatingFooter" class="glass-footer fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-10 px-6 py-3 rounded-full text-white text-xl z-50 shadow-lg">
    <a href="index.html" class="hover:scale-125 transition">
      <i class="fa-solid fa-home"></i>
    </a>

    <button id="footerBookmarks" class="hover:scale-125 transition">
      <i class="fa-solid fa-bookmark"></i>
    </button>

    <button id="footerSubmit" 
      class="text-white text-3xl hover:scale-125 transition relative -mt-8 rounded-full p-4 
      bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 shadow-xl">
      <i class="fa-solid fa-plus"></i>
    </button>

    <button id="footerNotifications" class="hover:scale-125 transition relative">
      <i class="fa-solid fa-bell"></i>
      <span id="notifBadge" class="absolute -top-1 -right-2 bg-red-500 text-xs px-1.5 rounded-full hidden">0</span>
    </button>

    <button id="footerAccount" class="hover:scale-125 transition">
      <i class="fa-solid fa-user-circle"></i>
    </button>
  </div>

  <div id="toast" class="hidden fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm z-50">
    Login Required
  </div>
`;

// Toast
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

// Footer actions
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
    window.location.href = "account.html";
  }
});

// Firebase auth listener (only sets loggedIn, icon stays same)
onAuthStateChanged(auth, (user) => {
  loggedIn = !!user;
});

// Hide footer on scroll
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

  lastScrollTop = Math.max(scrollTop, 0);

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    footer.classList.remove("hidden-footer");
  }, 400);
});