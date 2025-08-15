import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
const db = getDatabase(app);

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

function enhanceContent(html) {
  let content = html;
  content = content.replace(/<blockquote>/g, '<blockquote class="border-l-4 border-green-400 pl-4 italic text-green-200">');
  content = content.replace(/<iframe.*?youtube\.com.*?<\/iframe>/g, match => {
    return `
      <div class="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
        <div class="flex items-center gap-2 mb-2 text-green-300">
          <i class="fa-brands fa-youtube text-red-500 text-lg"></i> YouTube Video
        </div>
        ${match}
      </div>
    `;
  });
  return content;
}

// ✅ Increment Likes
async function likePost(postId, uid) {
  const userLikeRef = ref(db, `user_likes/${uid}/post_${postId}`);
  const userLikeSnap = await get(userLikeRef);

  if (userLikeSnap.exists()) {
    alert("You already liked this post!");
    return;
  }

  // Increase like count in transaction style
  const likesRef = ref(db, `likes/post_${postId}`);
  const likesSnap = await get(likesRef);
  const currentLikes = likesSnap.exists() ? likesSnap.val() : 0;

  await set(likesRef, currentLikes + 1);
  await set(userLikeRef, true);
}

async function fetchAndShowPost() {
  try {
    const postId = new URLSearchParams(window.location.search).get("id");

    const resPost = await fetch(`${blogURL}/posts/${postId}?_embed=1`);
    const post = await resPost.json();

    const resComments = await fetch(`${blogURL}/comments?post=${postId}&per_page=1`);
    const commentsCount = parseInt(resComments.headers.get("X-WP-Total")) || 0;

    const imageUrl = post.jetpack_featured_media_url
      || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
      || "assets/images/default.jpg";

    const categories = post._embedded?.["wp:term"]?.[0]?.map(cat =>
      `<span class="px-3 py-1 bg-green-900/40 text-green-300 rounded-full text-xs">${cat.name}</span>`
    ).join(" ") || "";

    const authorName = post._embedded?.author?.[0]?.name || "Admin";

    postContainer.innerHTML = `
      <img src="${imageUrl}" class="w-full h-64 object-cover rounded-xl mb-4">
      <h1 class="text-2xl font-bold text-green-300 mb-3">${post.title.rendered}</h1>
      <div class="prose prose-invert max-w-none mb-6">${enhanceContent(post.content.rendered)}</div>
      <div class="bg-white/5 backdrop-blur-md rounded-xl p-4 flex flex-wrap items-center gap-4 text-sm text-gray-300 border border-white/10">
        <span class="flex items-center gap-2"><i class="fa-solid fa-user text-green-400"></i> ${authorName}</span>
        <span class="flex items-center gap-2"><i class="fa-solid fa-calendar-days text-green-400"></i> ${timeAgo(post.date)}</span>
        <span class="flex items-center gap-2"><i class="fa-solid fa-thumbs-up text-green-400"></i> <span id="likes-count">0</span> Likes</span>
        <span class="flex items-center gap-2"><i class="fa-solid fa-comment text-green-400"></i> ${commentsCount} Comments</span>
        <div class="flex items-center gap-2 flex-wrap">
          <i class="fa-solid fa-tags text-green-400"></i> ${categories}
        </div>
      </div>
      <div class="flex justify-between items-center text-sm text-gray-400 border-t border-white/10 pt-4 mt-6">
        <div class="flex gap-4">
          <button id="like-btn" class="hover:text-green-400"><i class="fa-solid fa-thumbs-up"></i></button>
          <button class="hover:text-green-400"><i class="fa-solid fa-comment"></i></button>
          <button onclick="sharePost('${post.link}')" class="hover:text-green-400"><i class="fa-solid fa-share-nodes"></i></button>
        </div>
      </div>
    `;

    // ✅ Real-time listener for likes
    const likesRef = ref(db, `likes/post_${postId}`);
    onValue(likesRef, snapshot => {
      document.getElementById("likes-count").textContent = snapshot.exists() ? snapshot.val() : 0;
    });

    // ✅ Like button click handler
    onAuthStateChanged(auth, user => {
      if (user) {
        document.getElementById("like-btn").addEventListener("click", () => likePost(postId, user.uid));
      } else {
        document.getElementById("like-btn").addEventListener("click", () => alert("Please log in to like posts."));
      }
    });

    hideSpinner();
  } catch (err) {
    console.error("Error loading post:", err);
    postContainer.innerHTML = `<p class="text-red-400 text-center">Error loading post.</p>`;
    hideSpinner();
  }
}

function sharePost(url) {
  if (navigator.share) {
    navigator.share({ title: "Check this out", url }).catch(err => console.error("Share failed:", err));
  } else {
    alert("Sharing not supported on this browser.");
  }
}

fetchAndShowPost();