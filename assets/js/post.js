import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get, set, remove, onValue, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

// ✅ Content Enhancer
function enhanceContent(html) {
  let content = html;

  // Headings
  content = content.replace(/<h1>/g, '<h1 class="text-3xl font-bold text-green-300 mb-4">')
                   .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-green-300 mt-6 mb-3">')
                   .replace(/<h3>/g, '<h3 class="text-xl font-semibold text-green-200 mt-5 mb-2">')
                   .replace(/<h4>/g, '<h4 class="text-lg font-semibold text-green-200 mt-4 mb-2">')
                   .replace(/<h5>/g, '<h5 class="text-base font-semibold text-green-200 mt-3 mb-1">');

  // Drop caps
  content = content.replace(/<p>(\s*\w)/, '<p><span class="drop-cap">$1</span>');

  // Blockquotes
  content = content.replace(/<blockquote>/g, '<blockquote class="border-l-4 border-green-400 pl-4 italic text-green-200 bg-green-900/20 rounded-lg py-2">');

  // Images
  content = content.replace(/<img(.*?)>/g, '<div class="bg-white/5 border border-white/10 rounded-xl p-2 mb-4"><img$1 class="rounded-lg object-cover w-full h-[300px] sm:h-[200px]" /></div>');

  // YouTube iframes
  content = content.replace(/<iframe[^>]*youtube\.com[^>]*><\/iframe>/g, match => {
    let cleaned = match.replace(/width="\d+"/gi, 'width="100%"').replace(/height="\d+"/gi, 'height="315"').replace(/style="[^"]*"/gi, '');
    return `<div class="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
              <div class="flex items-center gap-2 mb-2 text-green-300">
                <i class="fa-brands fa-youtube text-red-500 text-lg"></i> YouTube Video
              </div>
              <div class="video-wrapper">${cleaned}</div>
            </div>`;
  });

  // Tables
  content = content.replace(/<table>/g, '<table class="w-full border border-white/20 rounded-lg mb-4">')
                   .replace(/<tr>/g, '<tr class="border-b border-white/10">')
                   .replace(/<th>/g, '<th class="border border-white/10 px-4 py-2 text-left">')
                   .replace(/<td>/g, '<td class="border border-white/10 px-4 py-2">');

  return content;
}

// ✅ Likes
function toggleLike(postId, uid) {
  const likeRef = ref(db, `likes/${postId}/${uid}`);
  const likeBtn = document.getElementById("like-btn");
  const likeIcon = document.getElementById("like-icon");
  const likeCountEl = document.getElementById("like-count");

  get(likeRef).then(snapshot => {
    let currentCount = parseInt(likeCountEl.textContent) || 0;
    if (snapshot.exists()) {
      remove(likeRef);
      likeCountEl.textContent = Math.max(currentCount - 1, 0);
      likeBtn.classList.remove("text-green-400");
      likeIcon.classList.replace("fa-solid", "fa-regular");
    } else {
      set(likeRef, true);
      likeCountEl.textContent = currentCount + 1;
      likeBtn.classList.add("text-green-400");
      likeIcon.classList.replace("fa-regular", "fa-solid");
    }

    likeBtn.classList.remove("like-pulse");
    void likeBtn.offsetWidth;
    likeBtn.classList.add("like-pulse");
  });
}

function listenLikes(postId) {
  const likesRef = ref(db, `likes/${postId}`);
  onValue(likesRef, snapshot => {
    const data = snapshot.val() || {};
    document.getElementById("like-count").textContent = Object.keys(data).length;
    onAuthStateChanged(auth, user => {
      const likeBtn = document.getElementById("like-btn");
      const likeIcon = document.getElementById("like-icon");
      if (user && data[user.uid]) {
        likeBtn.classList.add("text-green-400");
        likeIcon.classList.replace("fa-regular", "fa-solid");
      } else {
        likeBtn.classList.remove("text-green-400");
        likeIcon.classList.replace("fa-solid", "fa-regular");
      }
    });
  });
}

// ✅ Render Post
function renderPost(post) {
  const content = enhanceContent(post.content.rendered);
  postContainer.innerHTML = `
    <div class="prose max-w-none text-gray-200">
      ${content}
      <div class="mt-6 border-t border-white/10 pt-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <button id="like-btn" class="flex items-center gap-1 text-gray-400 transition-all">
            <i id="like-icon" class="fa-regular fa-heart"></i>
            <span id="like-count">0</span>
          </button>
        </div>
      </div>
      <div id="comments" class="mt-8 space-y-4">
        <h3 class="text-xl font-bold text-green-300">Comments</h3>
        <div id="comment-list" class="space-y-3"></div>
        <textarea id="comment-input" class="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-gray-200" placeholder="Add a comment..."></textarea>
        <button id="comment-btn" class="px-4 py-2 bg-green-400 text-black rounded-lg mt-2">Submit</button>
      </div>
      <div class="h-24"></div> <!-- Bottom spacing -->
    </div>
  `;

  listenLikes(post.id);

  // Comment submission
  const commentBtn = document.getElementById("comment-btn");
  const commentInput = document.getElementById("comment-input");
  const commentList = document.getElementById("comment-list");

  commentBtn.addEventListener("click", () => {
    onAuthStateChanged(auth, user => {
      if (!user) return alert("Login to comment.");
      const commentText = commentInput.value.trim();
      if (!commentText) return;
      const newCommentRef = push(ref(db, `comments/${post.id}`));
      set(newCommentRef, { uid: user.uid, text: commentText, timestamp: Date.now() });
      commentInput.value = "";
    });
  });

  // Listen for comments
  onValue(ref(db, `comments/${post.id}`), snapshot => {
    const data = snapshot.val() || {};
    commentList.innerHTML = Object.values(data).map(c => `
      <div class="bg-white/5 border border-white/10 p-2 rounded-lg">
        <span class="font-semibold text-green-300">${c.uid}</span>: ${c.text}
      </div>
    `).join("");
  });
}

// Example: load a sample post
fetch("https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?per_page=1")
  .then(res => res.json())
  .then(posts => {
    hideSpinner();
    renderPost(posts[0]);
  });