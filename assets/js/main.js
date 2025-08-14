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
const searchInput = document.getElementById("searchInput");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let currentPage = 1;
const postsPerPage = 6;
let totalPages = null;
let isLoading = false;
let isLoggedIn = false;

// ✅ Fetch posts on load
fetchPosts();

// ✅ Monitor login status
onAuthStateChanged(auth, user => {
  isLoggedIn = !!user;
  container.innerHTML = "";
  currentPage = 1;
  fetchPosts();
});

// ✅ Search functionality
searchInput?.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  currentPage = 1;

  if (query.length > 2) {
    fetch(`${blogURL}/posts?search=${query}&per_page=${postsPerPage}&page=1&_embed=1`)
      .then(res => res.json())
      .then(posts => {
        container.innerHTML = "";
        displayPosts(posts || []);
        loadMoreBtn.style.display = "none";
      })
      .catch(err => console.error("Search Error:", err));
  } else {
    container.innerHTML = "";
    fetchPosts();
  }
});

// ✅ Load More
loadMoreBtn?.addEventListener("click", () => {
  if (!isLoading && currentPage < totalPages) {
    currentPage++;
    fetchPosts();
  }
});

// ✅ Fetch posts from API
function fetchPosts() {
  isLoading = true;

  fetch(`${blogURL}/posts?per_page=${postsPerPage}&page=${currentPage}&_embed=1`)
    .then(async res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch posts. Status: ${res.status}`);
      }
      totalPages = parseInt(res.headers.get("X-WP-TotalPages")) || 1;
      return res.json();
    })
    .then(posts => {
      if (!Array.isArray(posts) || posts.length === 0) {
        container.innerHTML += `<p class="text-center col-span-full text-gray-400">No posts found.</p>`;
      } else {
        displayPosts(posts);
      }
      loadMoreBtn.style.display = currentPage >= totalPages ? "none" : "block";
      isLoading = false;
    })
    .catch(err => {
      console.error("Post Fetch Error:", err);
      container.innerHTML += `<p class="text-red-400">Error loading posts. Try again later.</p>`;
      isLoading = false;
    });
}

// ✅ Strip HTML tags
function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// ✅ Time formatter
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

// ✅ Display posts
function displayPosts(posts) {
  const bookmarkedIds = JSON.parse(localStorage.getItem("bookmarkedPosts") || "[]");

  posts.forEach(post => {
    if (!post?.id || !post?.title) return;

    let imageUrl = post.jetpack_featured_media_url
      || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
      || "";

    const image = imageUrl
      ? `<img src="${imageUrl}" class="w-full h-48 object-cover rounded-t-xl">`
      : `<div class="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400">No Image</div>`;

    // Dummy counts for now (replace with API values if available)
    const likesCount = post.likes_count || 0;
    const commentsCount = post.comment_count || post._embedded?.replies?.[0]?.length || 0;
    const viewsCount = post.views_count || Math.floor(Math.random() * 500); // Placeholder

    const isBookmarked = bookmarkedIds.includes(post.id);
    const bookmarkBtn = `
      <button
        class="bookmark-btn text-lg transition ${isLoggedIn ? 'text-green-300 hover:text-green-400' : 'text-gray-500 cursor-not-allowed'}"
        data-id="${post.id}"
        title="${isLoggedIn ? (isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks') : 'Login to Bookmark'}"
        ${isLoggedIn ? "" : "disabled"}
      >
        <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
      </button>`;

    container.innerHTML += `
      <div class="card rounded-xl overflow-hidden shadow-lg bg-white/5 border border-white/10">
        <a href="post.html?id=${post.id}" class="block">
          ${image}
          <div class="p-4">
            <h2 class="text-lg font-bold text-green-300 mb-2">${post.title.rendered}</h2>
            <p class="text-sm text-gray-300 mb-2">
              ${stripHTML(post.excerpt.rendered).slice(0, 100)}...
            </p>
          </div>
        </a>
        <div class="px-4 pb-4 text-xs text-gray-400">
          <div class="flex items-center gap-4 mb-2">
            <span class="flex items-center gap-1"><i class="fa-regular fa-heart"></i> ${likesCount}</span>
            <span class="flex items-center gap-1"><i class="fa-regular fa-comment"></i> ${commentsCount}</span>
            <span class="flex items-center gap-1"><i class="fa-regular fa-eye"></i> ${viewsCount}</span>
          </div>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <i class="fa-solid fa-user"></i> Admin
              </span>
              <span class="flex items-center gap-1">
                <i class="fa-solid fa-calendar-days"></i> ${timeAgo(post.date)}
              </span>
            </div>
            ${bookmarkBtn}
          </div>
        </div>
      </div>`;
  });

  if (isLoggedIn) attachBookmarkEvents();
}

// ✅ Bookmark toggle
function attachBookmarkEvents() {
  document.querySelectorAll(".bookmark-btn").forEach(button => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const id = parseInt(this.dataset.id);
      let bookmarks = JSON.parse