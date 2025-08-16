// post.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, push, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase setup
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

// Get Post ID from URL
const postId = new URLSearchParams(window.location.search).get("id");
const postURL = `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts/${postId}`;
const container = document.getElementById("post-container");
const footer = document.getElementById("footer");

// Add bottom padding for footer
function adjustPadding() {
  if (!footer) return;
  container.style.paddingBottom = `${footer.offsetHeight + 20}px`; // extra breathing space
}
window.addEventListener("resize", adjustPadding);
adjustPadding();

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
      <div class="bg-white/5 p-6 rounded-lg shadow-md text-white">

        <!-- Featured Image -->
        ${image}

        <!-- Title -->
        <h2 class="text-3xl font-bold mb-4">${post.title.rendered}</h2>

        <!-- Post Content -->
        <div class="post-content prose prose-invert max-w-none mb-6">
          ${contentWithResponsiveVideos}
        </div>

        <!-- Meta Info -->
        <div class="text-sm text-gray-400 mt-6 border-t border-gray-700 pt-3">
          👤 Author: TamilGeo | 🗓️ ${new Date(post.date).toLocaleDateString()}
        </div>

        <!-- Like & Share -->
        <div class="mt-6 flex items-center gap-3">
          <button onclick="likePost()" class="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600">♥ Like</button>
          <span id="like-count" class="text-sm text-gray-300">♥ 0 Likes</span>
          <button onclick="sharePost()" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">🔗 Share</button>
        </div>

        <!-- Comment Section -->
        <div class="mt-6">
          <h3 class="font-semibold text-lg mb-2">💬 Comments</h3>
          <textarea placeholder="Write a comment..." class="w-full p-2 border rounded mb-2 text-black" id="comment-box"></textarea>
          <button onclick="addComment()" class="bg-green-600 text-white px-3 py-1 rounded">Post Comment</button>
          <div id="comments" class="mt-4 space-y-2 text-sm text-gray-300"></div>
        </div>
      </div>
    `;

    // Load Firebase data
    updateLikeCount();
    loadComments();

    // Re-adjust bottom padding after content loads
    adjustPadding();

    // Inject extra CSS for quotes & tables
    const style = document.createElement("style");
    style.innerHTML = `
      .post-content blockquote {
        border-left: 4px solid #38bdf8;
        padding-left: 1rem;
        color: #d1d5db;
        font-style: italic;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.375rem;
        margin: 1rem 0;
      }
      .post-content table {
        border-collapse: collapse;
        width: 100%;
        margin: 1rem 0;
      }
      .post-content th,
      .post-content td {
        border: 1px solid #4b5563;
        padding: 0.5rem;
      }
      .post-content th {
        background-color: rgba(255, 255, 255, 0.1);
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  })
  .catch(err => {
    container.innerHTML = `<p class="text-red-400">❌ Failed to load post.</p>`;
    console.error(err);
  });

// Like functionality
function likePost() {
  const likeRef = ref(db, `likes/post_${postId}`);
  get(likeRef).then(snapshot => {
    const currentLikes = snapshot.exists() ? snapshot.val() : 0;
    set(likeRef, currentLikes + 1);
    updateLikeCount();
  });
}

function updateLikeCount() {
  const likeRef = ref(db, `likes/post_${postId}`);
  onValue(likeRef, snapshot => {
    const likeCount = snapshot.exists() ? snapshot.val() : 0;
    document.getElementById("like-count").innerText = `♥ ${likeCount} Likes`;
  });
}

// Share
function sharePost() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert("🔗 Post link copied to clipboard!");
  });
}

// Comment functionality
function addComment() {
  const commentBox = document.getElementById("comment-box");
  const commentText = commentBox.value.trim();
  if (!commentText) return;

  const commentRef = ref(db, `comments/post_${postId}`);
  push(commentRef, commentText).then(() => {
    commentBox.value = "";
    loadComments();
  });
}

function loadComments() {
  const commentsDiv = document.getElementById("comments");
  const commentRef = ref(db, `comments/post_${postId}`);
  onValue(commentRef, snapshot => {
    commentsDiv.innerHTML = ""; // clear everything
    if (snapshot.exists()) {
      const comments = snapshot.val();
      Object.values(comments).forEach(comment => {
        commentsDiv.innerHTML += `<div class="bg-gray-700 p-2 rounded">${comment}</div>`;
      });
    } else {
      commentsDiv.innerHTML = `<p class="text-gray-400">No comments yet.</p>`;
    }
  });
}