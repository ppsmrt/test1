// post.js

// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, push, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const container = document.getElementById("post-container");
const postId = new URLSearchParams(window.location.search).get("id");

if (!postId) {
  container.innerHTML = '<p class="text-red-500">❌ No post ID provided.</p>';
  throw new Error("Post ID missing in URL");
}

// Spinner overlay
container.innerHTML = `
  <div id="spinner" class="flex justify-center items-center h-40">
    <div class="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
`;

const postURL = `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts/${postId}`;

fetch(postURL)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then(post => {
    renderPost(post);
    updateLikeCount();
    loadComments();
  })
  .catch(err => {
    container.innerHTML = `<p class="text-red-500">❌ Failed to load post: ${err.message}</p>`;
    console.error(err);
  });

// Render post
function renderPost(post) {
  const image = post.jetpack_featured_media_url
    ? `<img src="${post.jetpack_featured_media_url}" class="w-full h-60 object-cover rounded-md mb-4">`
    : "";

  const contentWithResponsiveVideos = post.content.rendered.replace(
    /<iframe.*?<\/iframe>/g,
    match => `<div class="video-container mb-4">${match}</div>`
  );

  container.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow text-gray-900">
      <h2 class="text-2xl font-bold mb-2">${post.title.rendered}</h2>
      <div class="text-sm text-gray-500 mb-4">
        👤 Author: TamilGeo | 🗓️ ${new Date(post.date).toLocaleDateString()}
      </div>
      ${image}
      <div class="post-content prose max-w-none mb-6">${contentWithResponsiveVideos}</div>

      <!-- Like & Share -->
      <div class="mt-4 flex items-center gap-3">
        <button id="like-btn" class="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600">♥ Like</button>
        <span id="like-count" class="text-sm text-gray-600">♥ 0 Likes</span>
        <button id="share-btn" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">🔗 Share</button>
      </div>

      <!-- Comment Section -->
      <div class="mt-6">
        <h3 class="font-semibold text-lg mb-2">💬 Comments</h3>
        <textarea placeholder="Write a comment..." class="w-full p-2 border rounded mb-2" id="comment-box"></textarea>
        <button id="comment-btn" class="bg-green-600 text-white px-3 py-1 rounded">Post Comment</button>
        <div id="comments" class="mt-4 space-y-2 text-sm text-gray-700"></div>
      </div>
    </div>
  `;

  // Attach event listeners
  document.getElementById("like-btn").addEventListener("click", likePost);
  document.getElementById("share-btn").addEventListener("click", sharePost);
  document.getElementById("comment-btn").addEventListener("click", addComment);
}

// Likes
function likePost() {
  const likeRef = ref(db, `likes/post_${postId}`);
  get(likeRef).then(snapshot => {
    const currentLikes = snapshot.exists() ? snapshot.val() : 0;
    set(likeRef, currentLikes + 1);
    alert("♥ You liked this post!");
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
  navigator.clipboard.writeText(window.location.href);
  alert("🔗 Post link copied to clipboard!");
}

// Comments
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
      Object.values(snapshot.val()).forEach(comment => {
        commentsDiv.innerHTML += `<div class="bg-gray-100 p-2 rounded">${comment}</div>`;
      });
    }
  });
}

// Add spacer for floating footer
const spacer = document.createElement("div");
spacer.style.height = "80px"; // Adjust height to match your footer
container.appendChild(spacer);