import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, updateEmail, updatePassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

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
const storage = getStorage(app);

function showToast(message, type = "error") {
  const toast = document.createElement("div");
  toast.className = `fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white 
                     ${type === "success" ? "bg-green-500" : "bg-red-500"} z-50`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Load user info
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const snapshot = await get(ref(db, "users/" + user.uid));
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById("name").value = data.name || "";
      document.getElementById("username").value = data.username || "";
      document.getElementById("email").value = data.email || "";
      document.getElementById("role").value = data.role || "User";
      if (data.photoURL) {
        document.getElementById("profile-pic").src = data.photoURL;
      }
    }
  } catch (err) {
    showToast(err.message);
  }
});

// Handle profile photo upload (FIXED to update Auth & DB)
document.getElementById("profile-upload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Compress image
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const maxWidth = 300;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        try {
          const user = auth.currentUser;
          const storageRef = sRef(storage, "profilePhotos/" + user.uid + ".jpg");

          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);

          // Update Auth profile and Database
          await updateProfile(user, { photoURL: downloadURL });
          await update(ref(db, "users/" + user.uid), { photoURL: downloadURL });

          // Trigger footer instant update if needed
          localStorage.setItem("profileUpdated", "true");

          document.getElementById("profile-pic").src = downloadURL;
          showToast("Profile photo updated!", "success");
        } catch (err) {
          showToast(err.message);
        }
      }, "image/jpeg", 0.7);
    };
  };
});

// Save account changes
document.getElementById("save-account").addEventListener("click", async () => {
  const user = auth.currentUser;
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  try {
    await update(ref(db, "users/" + user.uid), { name, email });
    await updateEmail(user, email);
    showToast("Account updated!", "success");
  } catch (err) {
    showToast(err.message);
  }
});

// Update password
document.getElementById("update-password").addEventListener("click", async () => {
  const user = auth.currentUser;
  const newPass = document.getElementById("new-password").value;
  const confirmPass = document.getElementById("confirm-password").value;

  if (newPass !== confirmPass) {
    showToast("Passwords do not match!");
    return;
  }

  try {
    await updatePassword(user, newPass);
    showToast("Password updated!", "success");
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
  } catch (err) {
    showToast(err.message);
  }
});