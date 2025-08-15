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

// ✅ Enhance YouTube embeds & blockquotes
function enhanceContent(html) {
  let content = html;

  // Style blockquotes
  content = content.replace(/<blockquote>/g, '<blockquote class="border-l-4 border-green-400 pl-4 italic text-green-200 bg-green-900/20 rounded-lg py-2">');

  // Style YouTube embeds
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

// ✅ Like Handling
function handleLike(postId, likeBtn, likeCountEl) {
  onAuthStateChanged(auth, user => {
    if (!user) {
      likeBtn.addEventListener("click", () => alert("Please log in to like this post."));
      return;
    }

    const likeRef = ref(db, `likes/${postId}/${user.uid}`);

    onValue(likeRef, snapshot => {
      if (snapshot.exists()) {
        likeBtn.classList.add("text-green-400");
      } else {
        likeBtn.classList.remove("text-green-400");
      }
    });

    likeBtn.addEventListener("click", async () => {
      const snapshot = await get(likeRef);
      if (snapshot.exists()) {
        await remove(likeRef);
      } else {
        await set(likeRef, true);
      }
    });

    // Live like count
    const postLikesRef = ref(db, `likes/${postId}`);
    onValue(postLikesRef, snap => {
      likeCountEl.textContent = snap.exists() ? Object.keys(snap.val()).length : 0;
    });
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

    postContainer.innerHTML = `
      <!-- Featured Image -->
      <img src="${imageUrl}" class="w-full h-64 object-cover rounded-xl mb-4">

      <!-- Title -->
      <h1 class="text-2xl font-bold text-green-300 mb-3">${post.title.rendered}</h1>

      <!-- Content -->
      <div class="prose-custom mb-6">${enhanceContent(post.content.rendered)}</div>

      <!-- Meta Info Frosted Glass -->
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
      <div class="flex justify-between items-center text-sm text-gray-400 border-t border-white/10 pt-4 mt-6">
        <div class="flex gap-4">
          <button id="like-btn" class="hover:text-green-400"><i class="fa-solid fa-thumbs-up"></i></button>
          <button class="hover:text-green-400"><i class="fa-solid fa-comment"></i></button>
          <button onclick="shareNative('${post.link}')" class="hover:text-green-400"><i class="fa-solid fa-share-nodes"></i></button>
          <a href="https://wa.me/?text=${encodeURIComponent(post.link)}" target="_blank" class="hover:text-green-400"><i class="fa-brands fa-whatsapp"></i></a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.link)}" target="_blank" class="hover:text-green-400"><i class="fa-brands fa-facebook"></i></a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(post.link)}" target="_blank" class="hover:text-green-400"><i class="fa-brands fa-twitter"></i></a>
        </div>
      </div>

      <!-- Spacer -->
      <div class="h-24"></div>
    `;

    // Init like handling
    handleLike(`post_${postId}`, document.getElementById("like-btn"), document.getElementById("like-count"));

    hideSpinner();
  } catch (err) {
    console.error("Error loading post:", err);
    postContainer.innerHTML = `<p class="text-red-400 text-center">Error loading post.</p>`;
    hideSpinner();
  }
}

function shareNative(url) {
  if (navigator.share) {
    navigator.share({
      title: "Check this out",
      url
    }).catch(err => console.error("Share failed:", err));
  } else {
    alert("Sharing not supported on this browser.");
  }
}

fetchAndShowPost();