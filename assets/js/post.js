// Firebase setup
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, get, onValue } from "firebase/database";

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
const db = getDatabase(app);

// Get post ID from URL
const postId = new URLSearchParams(window.location.search).get("id");
const postURL = `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts/${postId}`;
const container = document.getElementById("post-container");

// Add spinner while loading
container.innerHTML = `
  <div class="flex justify-center items-center h-60">
    <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
  </div>
`;

// Spinner styles
const style = document.createElement("style");
style.innerHTML = `
.loader {
  border-top-color: #3498db;
  animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(style);

// Fetch and render post
fetch(postURL)
  .then(res => res.json())
  .then(post => {
    const image = post.jetpack_featured_media_url
      ? `<img src="${post.jetpack_featured_media_url}" class="w-full h-60 object-cover rounded-md mb-4">`
      : "";

    const contentWithResponsiveVideos = post.content.rendered.replace(
      /<iframe.*?<\/iframe>/g,
      match => `<div class="video-container mb-4">${match}</div>`
    );

    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow text-gray-900 opacity-0 transition-opacity duration-500">
        <h2 class="text-2xl font-bold mb-2">${post.title.rendered}</h2>
        <div class="text-sm text-gray-500 mb-4">
          👤 Author: TamilGeo | 🗓️ ${new Date(post.date).toLocaleDateString()}
        </div>
        ${image}
        <div class="post-content prose max-w-none mb-6">${contentWithResponsiveVideos}</div>

        <!-- Like & Share -->
        <div class="mt-4 flex items-center gap-3">
          <button id="like-btn" class="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 transition-transform duration-150 transform">
            ♥ Like
          </button>
          <span id="like-count" class="text-sm text-gray-600">♥ 0 Likes</span>
          <button id="share-btn" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-transform duration-150 transform">
            🔗 Share
          </button>
        </div>

        <!-- Comment Section -->
        <div class="mt-6">
          <h3 class="font-semibold text-lg mb-2">💬 Comments</h3>
          <textarea placeholder="Write a comment..." class="w-full p-2 border rounded mb-2" id="comment-box"></textarea>
          <button id="post-comment-btn" class="bg-green-600 text-white px-3 py-1 rounded transform transition-transform duration-200 hover:scale-105 active:scale-95">
            Post Comment
          </button>
          <div id="comments" class="mt-4 space-y-2 text-sm text-gray-700"></div>
        </div>
      </div>
    `;

    // Fade-in effect
    const contentDiv = container.querySelector("div.bg-white");
    setTimeout(() => contentDiv.style.opacity = 1, 50);

    // Initialize like and comment functionalities
    initLikeButton();
    initShareButton();
    initCommentButton();
    loadComments();
  })
  .catch(err => {
    container.innerHTML = `<div class="text-red-500">❌ Failed to load post. Please try again later.</div>`;
    console.error(err);
  });

// Like functionality
function initLikeButton() {
  const likeBtn = document.getElementById("like-btn");
  const likeCountEl = document.getElementById("like-count");
  const likeRef = ref(db, `likes/post_${postId}`);

  likeBtn.addEventListener("click", () => {
    get(likeRef).then(snapshot => {
      const currentLikes = snapshot.exists() ? snapshot.val() : 0;
      set(likeRef, currentLikes + 1).then(() => {
        animateLike();
        alert("♥ You liked this post!");
      });
    });
  });

  onValue(likeRef, snapshot => {
    const likeCount = snapshot.exists() ? snapshot.val() : 0;
    likeCountEl.innerText = `♥ ${likeCount} Likes`;
  });

  function animateLike() {
    likeCountEl.classList.add("scale-110");
    setTimeout(() => likeCountEl.classList.remove("scale-110"), 200);
  }
}

// Share functionality
function initShareButton() {
  const shareBtn = document.getElementById("share-btn");
  shareBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href);
    alert("🔗 Post link copied to clipboard!");
  });
}

// Comment functionality
function initCommentButton() {
  const commentBox = document.getElementById("comment-box");
  const postCommentBtn = document.getElementById("post-comment-btn");

  postCommentBtn.addEventListener("click", () => {
    const commentText = commentBox.value.trim();
    if (!commentText) return;

    const commentRef = ref(db, `comments/post_${postId}`);
    push(commentRef, commentText).then(() => {
      commentBox.value = "";
    });
  });
}

// Load comments live
function loadComments() {
  const commentsDiv = document.getElementById("comments");
  const commentRef = ref(db, `comments/post_${postId}`);

  onValue(commentRef, snapshot => {
    commentsDiv.innerHTML = "";
    if (snapshot.exists()) {
      const comments = snapshot.val();
      Object.values(comments).forEach(comment => {
        const commentEl = document.createElement("div");
        commentEl.className = "bg-gray-100 p-2 rounded";
        commentEl.innerText = comment;
        commentsDiv.appendChild(commentEl);
      });
    }
  });
}