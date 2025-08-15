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
  container.style.paddingBottom = `${footer.offsetHeight}px`;
}
window.addEventListener("resize", adjustPadding);
adjustPadding();

// Add loading spinner
container.innerHTML = `
  <div class="flex justify-center items-center h-64">
    <div class="loader ease-linear rounded-full border-8 border-t-8 border-gray-300 h-16 w-16"></div>
  </div>
  <style>
    .loader {
      border-top-color: #3498db;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`;

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
        <h2 class="text-2xl font-bold mb-2">${post.title.rendered}</h2>
        <div class="text-sm text-gray-400 mb-4">
          👤 Author: TamilGeo | 🗓️ ${new Date(post.date).toLocaleDateString()}
        </div>
        ${image}
        <div class="post-content prose max-w-none mb-6">${contentWithResponsiveVideos}</div>

        <!-- Like & Share -->
        <div class="mt-4 flex items-center gap-3">
          <button onclick="likePost()" class="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600">♥ Like</button>
          <span id="like-count" class="text-sm text-gray-300">♥ 0 Likes</span>
          <button onclick="sharePost()" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">🔗 Share</button>
        </div>

        <!-- Comment Section -->
        <div class="mt-6">
          <h3 class="font-semibold text-lg mb-2">💬 Comments</h3>
          <textarea placeholder="Write a comment..." class="w-full p-2 border rounded mb-2 text-black" id="comment-box"></textarea>
          <button onclick="addComment()" class="bg-green-600 text-white px-3 py-1 rounded">Post Comment</button>
          <div id="comments" class="mt-4 space-y-2 text-sm text-gray-300">
            <div class="flex justify-center items-center h-16">
              <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-8 w-8"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Load Firebase data
    updateLikeCount();
    loadComments();
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
  const commentRef = ref(db, `comments/post_${postId}`);
  onValue(commentRef, snapshot => {
    const commentsDiv = document.getElementById("comments");
    commentsDiv.innerHTML = "";
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