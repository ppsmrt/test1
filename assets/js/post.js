import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ✅ Firebase Config
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

const blogURL = "https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com";
const postContainer = document.getElementById("post-container");
const spinner = document.getElementById("spinner");

function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function timeAgo(dateString) {
  const now = new Date();
  const postDate = new Date(dateString);
  const diff = Math.floor((now - postDate) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return postDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function hideSpinner() {
  spinner.style.opacity = "0";
  setTimeout(() => {
    spinner.style.display = "none";
  }, 300);
}

async function fetchAndShowPost() {
  try {
    const postId = new URLSearchParams(window.location.search).get("id");
    const res = await fetch(`${blogURL}/posts/${postId}?_embed=1`);
    const post = await res.json();

    const imageUrl = post.jetpack_featured_media_url
      || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
      || "assets/images/default.jpg";

    const categories = post._embedded?.["wp:term"]?.[0]?.map(cat =>
      `<span class="px-3 py-1 bg-green-900/40 text-green-300 rounded-full text-xs">${cat.name}</span>`
    ).join(" ") || "";

    postContainer.innerHTML = `
      <!-- Featured Image -->
      <img src="${imageUrl}" class="w-full h-64 object-cover rounded-xl mb-4">

      <!-- Title -->
      <h1 class="text-2xl font-bold text-green-300 mb-3">${post.title.rendered}</h1>

      <!-- Categories -->
      <div class="flex flex-wrap items-center gap-2 mb-3">${categories}</div>

      <!-- Meta Info -->
      <div class="flex items-center gap-5 text-xs text-gray-400 mb-4 bg-white/5 px-4 py-2 rounded-lg">
        <span class="flex items-center gap-1"><i class="fa-solid fa-calendar-days"></i> ${timeAgo(post.date)}</span>
        <span class="flex items-center gap-1"><i class="fa-solid fa-clock"></i> ${Math.ceil(stripHTML(post.content.rendered).split(" ").length / 200)} min read</span>
      </div>

      <!-- Content -->
      <div class="prose prose-invert max-w-none">${post.content.rendered}</div>

      <!-- Social -->
      <div class="flex justify-between items-center text-sm text-gray-400 border-t border-white/10 pt-4 mt-6">
        <div class="flex gap-4">
          <button class="hover:text-green-400"><i class="fa-solid fa-thumbs-up"></i></button>
          <button class="hover:text-green-400"><i class="fa-solid fa-comment"></i></button>
          <button onclick="sharePost('${post.link}')" class="hover:text-green-400"><i class="fa-solid fa-share-nodes"></i></button>
        </div>
      </div>
    `;

    hideSpinner();
  } catch (err) {
    console.error("Error loading post:", err);
    postContainer.innerHTML = `<p class="text-red-400 text-center">Error loading post.</p>`;
    hideSpinner();
  }
}

function sharePost(url) {
  if (navigator.share) {
    navigator.share({
      title: "Check this out",
      url
    }).catch(err => console.error("Share failed:", err));
  } else {
    alert("Sharing not supported on this browser.");
  }
}

fetchAndShowPost();