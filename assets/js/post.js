// post.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, push, get, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const auth = getAuth(app);

// Get Post ID from URL
const postId = new URLSearchParams(window.location.search).get("id");
const postURL = `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts/${postId}`;
const container = document.getElementById("post-container");
const footer = document.getElementById("footer");

let currentUser = null;

// Add bottom padding for footer
function adjustPadding() {
  if (!footer) return;
  container.style.paddingBottom = `${footer.offsetHeight + 20}px`; // extra breathing space
}
window.addEventListener("resize", adjustPadding);
adjustPadding();

// Auth check
onAuthStateChanged(auth, user => {
  currentUser = user;
});

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

    const daysAgo = Math.floor((Date.now() - new Date(post.date)) / (1000 * 60 * 60 * 24));

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

        <!-- Meta Section -->
        <div class="bg-gray-800 p-4 rounded-lg mt-6 flex flex-col gap-2 text-sm">
          <div><i class="fa fa-user text-blue-400"></i> Author: TamilGeo</div>
          <div><i class="fa fa-folder text-green-400"></i> Category: ${post.categories?.[0] || "General"}</div>
          <div><i class="fa fa-clock text-yellow-400"></i> ${daysAgo} days ago</div>
        </div>

        <!-- Like Section -->
        <div class="bg-gray-900 p-4 rounded-lg mt-6">
          <button onclick="likePost()" class="flex items-center gap-2 text-lg text-pink-400 hover:text-pink-500 transition transform hover:scale-110">
            <i class="fa fa-heart"></i> Like this post
          </button>
          <div id="like-users" class="flex items-center gap-2 mt-3 text-sm text-gray-300"></div>
        </div>

        <!-- Comment Section -->
        <div class="bg-gray-800 p-4 rounded-lg mt-6">
          <h3 class="font-semibold text-lg mb-2"><i class="fa fa-comments text-cyan-400"></i> Comments</h3>
          <textarea placeholder="Write a comment..." class="w-full p-2 border rounded mb-2 text-black" id="comment-box"></textarea>
          <input type="text" id="comment-name" class="w-full p-2 border rounded mb-2 text-black" readonly value="${currentUser ? currentUser.displayName : 'Guest'}">
          <button onclick="addComment()" class="bg-green-600 text-white px-3 py-1 rounded">Submit Comment</button>
          <div id="comments" class="mt-4 space-y-2 text-sm text-gray-300"></div>
        </div>
      </div>
    `;

    // Load Firebase data
    updateLikeSection();
    loadComments();

    // Re-adjust bottom padding after content loads
    adjustPadding();

    // Inject extra CSS
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
      .like-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
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
  if (!currentUser) return alert("Please login to like this post.");
  const likeRef = ref(db, `likes/post_${postId}/${currentUser.uid}`);
  set(likeRef, true);
}

function updateLikeSection() {
  const likeRef = ref(db, `likes/post_${postId}`);
  onValue(likeRef, snapshot => {
    const likeUsersDiv = document.getElementById("like-users");
    if (!likeUsersDiv) return;
    likeUsersDiv.innerHTML = "";
    if (snapshot.exists()) {
      const userLikes = Object.keys(snapshot.val());
      get(ref(db, "users")).then(userSnap => {
        if (userSnap.exists()) {
          const users = userSnap.val();
          let avatars = "";
          userLikes.forEach(uid => {
            if (users[uid]?.profilePic) {
              avatars += `<img src="${users[uid].profilePic}" class="like-avatar">`;
            } else {
              avatars += `<i class="fa fa-user-circle text-gray-400 text-xl"></i>`;
            }
          });
          likeUsersDiv.innerHTML = `
            <div class="flex items-center gap-2">
              ${avatars}
              <span>${userLikes.length} people liked this post</span>
            </div>
          `;
        }
      });
    } else {
      likeUsersDiv.innerHTML = `<p class="text-gray-400">No likes yet.</p>`;
    }
  });
}

// Comment functionality
function addComment() {
  if (!currentUser) return alert("Please login to comment.");
  const commentBox = document.getElementById("comment-box");
  const commentText = commentBox.value.trim();
  if (!commentText) return;

  const commentRef = ref(db, `comments/post_${postId}`);
  const newComment = {
    uid: currentUser.uid,
    name: currentUser.displayName,
    text: commentText,
    timestamp: Date.now()
  };
  push(commentRef, newComment).then(() => {
    commentBox.value = "";
  });
}

function loadComments() {
  const commentsDiv = document.getElementById("comments");
  const commentRef = ref(db, `comments/post_${postId}`);
  onValue(commentRef, snapshot => {
    commentsDiv.innerHTML = "";
    if (snapshot.exists()) {
      const comments = snapshot.val();
      Object.values(comments).forEach(c => {
        commentsDiv.innerHTML += `
          <div class="bg-gray-700 p-2 rounded">
            <strong>${c.name}</strong>: ${c.text}
          </div>
        `;
      });
    } else {
      commentsDiv.innerHTML = `<p class="text-gray-400">No comments yet.</p>`;
    }
  });
}