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

// ✅ Display posts (FA icons for meta)
function displayPosts(posts) {
  const bookmarkedIds = JSON.parse(localStorage.getItem("bookmarkedPosts") || "[]");

  posts.forEach(post => {
    if (!post || !post.id || !post.title) return;

    let imageUrl = "";
    if (post.jetpack_featured_media_url) {
      imageUrl = post.jetpack_featured_media_url;
    } else if (post._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
      imageUrl = post._embedded["wp:featuredmedia"][0].source_url;
    }

    const image = imageUrl
      ? `<img src="${imageUrl}" class="w-full h-48 object-cover rounded-t-xl">`
      : `<div class="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400">No Image</div>`;

    const isBookmarked = bookmarkedIds.includes(post.id);
    const bookmarkBtn = `
      <button
        class="rounded-full p-1 shadow-lg transition text-sm bookmark-btn ${isLoggedIn ? 'bg-white/20 hover:bg-green-400/40 text-green-300' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}"
        data-id="${post.id}"
        title="${isLoggedIn ? (isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks') : 'Login to Bookmark'}"
        ${isLoggedIn ? "" : "disabled"}
      >
        <i class="fa ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>
      </button>`;

    // Placeholder counts (replace with real data if available)
    const likesCount = Math.floor(Math.random() * 500);
    const commentsCount = post._embedded?.replies?.[0]?.length || Math.floor(Math.random() * 100);
    const viewsCount = Math.floor(Math.random() * 2000);

    container.innerHTML += `
      <div class="relative card rounded-xl overflow-hidden shadow-lg">
        <a href="post.html?id=${post.id}" class="block">
          ${image}
          <div class="p-4">
            <h2 class="text-lg font-bold text-green-300 mb-2">${post.title.rendered}</h2>
            <p class="text-sm text-gray-300 mb-2">${stripHTML(post.excerpt.rendered).slice(0, 100)}...</p>
            <div class="flex justify-between items-center text-xs text-gray-400 mt-4 gap-3">
              <span><i class="fa fa-heart"></i> <small>${likesCount}</small></span>
              <span><i class="fa fa-comment"></i> <small>${commentsCount}</small></span>
              <span><i class="fa fa-eye"></i> <small>${viewsCount}</small></span>
              ${bookmarkBtn}
            </div>
          </div>
        </a>
      </div>`;
  });

  if (isLoggedIn) attachBookmarkEvents();
}

// ✅ Bookmark click handler
function attachBookmarkEvents() {
  document.querySelectorAll(".bookmark-btn").forEach(button => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const id = parseInt(this.dataset.id);
      let bookmarks = JSON.parse(localStorage.getItem("bookmarkedPosts") || "[]");

      if (bookmarks.includes(id)) {
        bookmarks = bookmarks.filter(bid => bid !== id);
        this.innerHTML = `<i class="fa fa-bookmark-o"></i>`;
        this.title = "Add to Bookmarks";
      } else {
        bookmarks.push(id);
        this.innerHTML = `<i class="fa fa-bookmark"></i>`;
        this.title = "Remove Bookmark";
      }

      localStorage.setItem("bookmarkedPosts", JSON.stringify(bookmarks));
    });
  });
}