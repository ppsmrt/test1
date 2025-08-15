// Post.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

function timeAgo(dateString) {
  const now = new Date();
  const postDate = new Date(dateString);
  const diff = Math.floor((now - postDate) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return postDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function hideSpinner() {
  spinner.style.opacity = "0";
  setTimeout(() => { spinner.style.display = "none"; }, 300);
}

// ✅ Enhance content: typography, YouTube fix, quotes, separators, images
function enhanceContent(html) {
  let content = html;

  // Headings styled to match theme
  content = content
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-green-300 mb-4">')
    .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-green-300 mt-6 mb-3">')
    .replace(/<h3>/g, '<h3 class="text-xl font-semibold text-green-200 mt-5 mb-2">')
    .replace(/<h4>/g, '<h4 class="text-lg font-semibold text-green-200 mt-4 mb-2">')
    .replace(/<h5>/g, '<h5 class="text-base font-semibold text-green-200 mt-3 mb-1">');

  // Style blockquotes
  content = content.replace(/<blockquote>/g, '<blockquote class="border-l-4 border-green-400 pl-4 italic text-green-200 bg-green-900/20 rounded-lg py-2">');

  // Make all images uniform inside a styled box
  content = content.replace(/<img(.*?)>/g, '<div class="bg-white/5 border border-white/10 rounded-xl p-2 mb-4"><img$1 class="rounded-lg object-cover w-full h-[300px] sm:h-[200px]" /></div>');

  // Responsive YouTube embeds (strip inline width/height)
  content = content.replace(/<iframe[^>]*youtube\.com[^>]*><\/iframe>/g, match => {
    let cleaned = match
      .replace(/width="\d+"/gi, 'width="100%"')
      .replace(/height="\d+"/gi, '')
      .replace(/style="[^"]*"/gi, '');

    return `
      <div class="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
        <div class="flex items-center gap-2 mb-2 text-green-300">
          <i class="fa-brands fa-youtube text-red-500 text-lg"></i> YouTube Video
        </div>
        <div class="video-wrapper">${cleaned}</div>
      </div>
    `;
  });

  // Split paragraphs by custom separator (e.g., |||)
  content = content.replace(/(\|\|\|+)/g, '§§§SPLIT§§§'); // temporary unique marker
  if (content.includes("§§§SPLIT§§§")) {
    const parts = content.split("§§§SPLIT§§§").map(part => {
      return `<div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 leading-relaxed">${part.trim()}</div>`;
    });
    content = parts.join("");
  }

  return content;
}

// ✅ Like feature
function toggleLike(postId, uid) {
  const likeRef = ref(db, `likes/${postId}/${uid}`);
  get(likeRef).then(snapshot => {
    snapshot.exists() ? remove(likeRef) : set(likeRef, true);
  });
}

function listenLikes(postId) {
  const likesRef = ref(db, `likes/${postId}`);
  onValue(likesRef, snapshot => {
    const data = snapshot.val() || {};
    document.getElementById("like-count").textContent = Object.keys(data).length;
  });
}

async function fetchAndShowPost() {
  try {
    const postId = new URLSearchParams(window.location.search).get("id");

    // Fetch post
    const resPost = await fetch(`${blogURL}/posts/${postId}?_embed=1`);
    const post = await resPost.json();

    // Fetch comment count
    const resComments = await fetch(`${blogURL}/comments?post=${postId}&per_page=1`);
    const commentsCount = parseInt(resComments.headers.get("X-WP-Total")) || 0;

    const imageUrl = post.jetpack_featured_media_url
      || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
      || "assets/images/default.jpg";

    const categories = post._embedded?.["wp:term"]?.[0]?.map(cat =>
      `<span class="px-3 py-1 bg-green-900/40 text-green-300 rounded-full text-xs">${cat.name}</span>`
    ).join(" ") || "";

    const authorName = post._embedded?.author?.[0]?.name || "Admin";
    const postKey = `post_${postId}`;

    postContainer.innerHTML = `
      <!-- Featured Image -->
      <img src="${imageUrl}" class="w-full h-64 object-cover rounded-xl mb-4">

      <!-- Title -->
      <h1 class="text-2xl font-bold text-green-300 mb-3">${post.title.rendered}</h1>

      <!-- Content -->
      <div class="prose-custom mb-6">${enhanceContent(post.content.rendered)}</div>

      <!-- Meta Info -->
      <div class="bg-white/5 backdrop-blur-md rounded-xl p-4 flex flex-wrap items-center gap-4 text-sm text-gray-300 border border-white/10">
        <span class="flex items-center gap-2"><i class="fa-solid fa-user text-green-400"></i> ${authorName}</span>
        <span class="flex items-center gap-2"><i class="fa-solid fa-calendar-days text-green-400"></i> ${timeAgo(post.date)}</span>
        <span class="flex items-center gap-2"><i class="fa-solid fa-thumbs-up text-green-400"></i> <span id="like-count">0</span> Likes</span>
        <span class="flex items-center gap-2"><i class="fa-solid fa-comment text-green-400"></i> ${commentsCount} Comments</span>
        <div class="flex items-center gap-2 flex-wrap">
          <i class="fa-solid fa-tags text-green-400"></i> ${categories}
        </div>
      </div>

      <!-- Social -->
      <div class="flex justify-between items-center text-sm text-gray-400 border-t border-white/10 pt-4 mt-6 mb-20">
        <div class="flex gap-4">
          <button id="like-btn" class="hover:text-green-400"><i class="fa-solid fa-thumbs-up"></i></button>
          <a href="https://wa.me/?text=${encodeURIComponent(post.link)}" target="_blank" class="hover:text-green-400"><i class="fa-brands fa-whatsapp"></i></a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.link)}" target="_blank" class="hover:text-green-400"><i class="fa-brands fa-facebook"></i></a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(post.link)}" target="_blank" class="hover:text-green-400"><i class="fa-brands fa-twitter"></i></a>
          <button onclick="sharePost('${post.link}')" class="hover:text-green-400"><i class="fa-solid fa-share-nodes"></i></button>
        </div>
      </div>
    `;

    listenLikes(postKey);

    onAuthStateChanged(auth, user => {
      const likeBtn = document.getElementById("like-btn");
      if (user) {
        likeBtn.addEventListener("click", () => toggleLike(postKey, user.uid));
      } else {
        likeBtn.addEventListener("click", () => alert("Please log in to like posts."));
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
    navigator.share({ title: "Check this out", url })
      .catch(err => console.error("Share failed:", err));
  } else {
    alert("Sharing not supported on this browser.");
  }
}

fetchAndShowPost();