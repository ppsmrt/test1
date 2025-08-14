import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const container = document.getElementById("posts-container");
let isLoggedIn = false;

onAuthStateChanged(auth, user => {
  isLoggedIn = !!user;
  container.innerHTML = "";
  fetchPosts();
});

async function fetchPosts() {
  try {
    const res = await fetch(`${blogURL}/posts?_embed=1&per_page=6&page=1`);
    const posts = await res.json();

    if (!Array.isArray(posts)) {
      container.innerHTML = `<p class="text-gray-400 text-center">No posts found.</p>`;
      return;
    }

    displayPosts(posts);
  } catch (err) {
    console.error("Error loading posts:", err);
    container.innerHTML = `<p class="text-red-400 text-center">Error loading posts. Please try again later.</p>`;
  }
}

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

function displayPosts(posts) {
  posts.forEach(post => {
    const imageUrl = post.jetpack_featured_media_url
      || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
      || "assets/images/default.jpg";

    const categories = post._embedded?.["wp:term"]?.[0]?.map(cat =>
      `<span class="px-3 py-1 bg-green-900/40 text-green-300 rounded-full text-xs">${cat.name}</span>`
    ).join(" ") || "";

    const excerpt = stripHTML(post.excerpt.rendered).slice(0, 150);

    container.innerHTML += `
      <div class="rounded-xl overflow-hidden shadow-lg bg-white/5 border border-white/10 backdrop-blur-md hover:border-green-400/30 transition-all">
        <!-- Featured Image -->
        <img src="${imageUrl}" class="w-full h-56 object-cover">

        <!-- Content -->
        <div class="p-5">
          <h2 class="text-xl font-bold text-green-300 mb-3 leading-snug">${post.title.rendered}</h2>

          <!-- Categories -->
          <div class="flex flex-wrap items-center gap-2 mb-3">
            ${categories}
          </div>

          <!-- Meta Info -->
          <div class="flex items-center gap-5 text-xs text-gray-400 mb-4">
            <span class="flex items-center gap-1"><i class="fa-solid fa-user"></i> Admin</span>
            <span class="flex items-center gap-1"><i class="fa-solid fa-calendar-days"></i> ${timeAgo(post.date)}</span>
            <span class="flex items-center gap-1"><i class="fa-solid fa-clock"></i> ${Math.ceil(stripHTML(post.content.rendered).split(" ").length / 200)} min read</span>
          </div>

          <!-- Excerpt -->
          <p class="text-sm text-gray-300 leading-relaxed mb-5">${excerpt}...</p>

          <!-- Social & Read More -->
          <div class="flex justify-between items-center text-sm text-gray-400 border-t border-white/10 pt-4">
            <div class="flex gap-4">
              <button class="hover:text-green-400"><i class="fa-solid fa-thumbs-up"></i></button>
              <button class="hover:text-green-400"><i class="fa-solid fa-comment"></i></button>
              <button onclick="sharePost('${post.link}')" class="hover:text-green-400"><i class="fa-solid fa-share-nodes"></i></button>
            </div>
            <a href="post.html?id=${post.id}" class="text-green-300 hover:underline font-medium">Read More</a>
          </div>
        </div>
      </div>
    `;
  });
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

fetchPosts();
