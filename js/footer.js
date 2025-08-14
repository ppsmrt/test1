// footer.js
import { getAuth, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();
let loggedIn = false;

// ✅ Inject Footer HTML
document.getElementById("footer").innerHTML = `
  <div class="flex items-center justify-between w-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 px-6 py-3 rounded-full shadow-xl text-white text-sm backdrop-blur-lg border border-white/10">
    
    <!-- Home -->
    <a href="index.html" class="flex flex-col items-center hover:scale-110 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
      </svg>
      Home
    </a>

    <!-- Bookmarks -->
    <button id="footerBookmarks" class="flex flex-col items-center hover:scale-110 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M5 5v16l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
      </svg>
      Bookmarks
    </button>

    <!-- Submit -->
    <button id="footerSubmit" class="flex flex-col items-center hover:scale-110 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 4v16m8-8H4" />
      </svg>
      Submit
    </button>

    <!-- Account -->
    <button id="footerAccount" class="flex flex-col items-center hover:scale-110 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Account
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
    const photoURL = user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.displayName || "User") + "&background=random&color=fff";
    accountBtn.innerHTML = `
      <img src="${photoURL}" class="h-6 w-6 mb-1 rounded-full border border-white" alt="Profile">
      Logout
    `;
  } else {
    accountBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Account
    `;
  }
});