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

const blogURL = "https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com";
const postContainer = document.getElementById("post-container");
const spinner = document.getElementById("spinner");

function timeAgo(dateString) {
const now = new Date();
const postDate = new Date(dateString);
const diff = Math.floor((now - postDate) / 1000);

if (diff < 60) return "Just now";
if (diff < 3600) return ${Math.floor(diff / 60)} mins ago;
if (diff < 86400) return ${Math.floor(diff / 3600)} hrs ago;
if (diff < 604800) return ${Math.floor(diff / 86400)} days ago;

return postDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function hideSpinner() {
spinner.style.opacity = "0";
setTimeout(() => { spinner.style.display = "none"; }, 300);
}

// ✅ Enhance content: typography, YouTube fix, quotes, separators, images
function enhanceContent(html) {
let content = html;

content = content.replace(/<hr\s*/?>/gi, '|||');

content = content
.replace(/<h1>/g, '<h1 class="text-3xl font-bold text-green-300 mb-4">')
.replace(/<h2>/g, '<h2 class="text-2xl font-bold text-green-300 mt-6 mb-3">')
.replace(/<h3>/g, '<h3 class="text-xl font-semibold text-green-200 mt-5 mb-2">')
.replace(/<h4>/g, '<h4 class="text-lg font-semibold text-green-200 mt-4 mb-2">')
.replace(/<h5>/g, '<h5 class="text-base font-semibold text-green-200 mt-3 mb-1">');

content = content.replace(/<blockquote>/g, '<blockquote class="border-l-4 border-green-400 pl-4 italic text-green-200 bg-green-900/20 rounded-lg py-2">');

content = content.replace(/<img(.*?)>/g, '<div class="bg-white/5 border border-white/10 rounded-xl p-2 mb-4"><img$1 class="rounded-lg object-cover w-full h-[300px] sm:h-[200px]" /></div>');

content = content.replace(/<iframe[^>]youtube.com[^>]></iframe>/g, match => {
let cleaned = match
.replace(/width="\d+"/gi, 'width="100%"')
.replace(/height="\d+"/gi, 'height="315"')
.replace(/style="[^"]*"/gi, '');
return   <div class="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">   <div class="flex items-center gap-2 mb-2 text-green-300">   <i class="fa-brands fa-youtube text-red-500 text-lg"></i> YouTube Video   </div>   <div class="video-wrapper">${cleaned}</div>   </div>  ;
});

if (content.includes("|||")) {
content = content.split("|||").map(part => {
let trimmed = part.trim();
if (!trimmed) return "";
if (trimmed.includes("<blockquote")) {
return <div class="bg-green-900/20 border-l-4 border-green-400 rounded-lg p-4 mb-4 fade-in">${trimmed}</div>;
} else if (trimmed.match(/<h[1-6]>/)) {
return <div class="mb-4 fade-in">${trimmed}</div>;
} else if (trimmed.includes("<ul") || trimmed.includes("<ol")) {
return <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 fade-in">${trimmed}</div>;
} else {
return <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 leading-relaxed fade-in">${trimmed}</div>;
}
}).join("");
}

return content;
}

// ✅ Like feature
function toggleLike(postId, uid) {
const likeRef = ref(db, likes/${postId}/${uid});
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
const likesRef = ref(db, likes/${postId});
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

// ✅ Render Like Section
function renderLikeSection(postKey, commentsCount, categories, authorName, postDate) {
return   <div class="bg-white/5 backdrop-blur-md rounded-xl p-4 text-sm text-gray-300 border border-white/10 space-y-4">   <div class="flex flex-wrap items-center gap-4">   <span class="flex items-center gap-2"><i class="fa-solid fa-user text-green-400"></i> ${authorName}</span>   <span class="flex items-center gap-2"><i class="fa-solid fa-calendar-days text-green-400"></i> ${timeAgo(postDate)}</span>   <div class="flex items-center gap-2 flex-wrap">   <i class="fa-solid fa-tags text-green-400"></i> ${categories}   </div>   </div>   <div class="flex items-center justify-between border-t border-white/10 pt-3">   <div class="flex items-center gap-3">   <button id="like-btn" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900/30 hover:bg-green-900/50 transition shadow-md" title="Like this post">   <i id="like-icon" class="fa-regular fa-thumbs-up text-lg"></i>   <span id="like-count" class="font-medium">0</span>   </button>   <span class="flex items-center gap-2 text-gray-400"><i class="fa-solid fa-comment text-green-400"></i> ${commentsCount} Comments</span>   </div>   <div class="flex gap-4 text-gray-400">   <a href="https://wa.me/?text=${encodeURIComponent(location.href)}" target="_blank" class="hover:text-green-400"><i class="fa-brands fa-whatsapp"></i></a>   <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" class="hover:text-green-400"><i class="fa-brands fa-facebook"></i></a>   <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}" target="_blank" class="hover:text-green-400"><i class="fa-brands fa-twitter"></i></a>   <button onclick="sharePost('${location.href}')" class="hover:text-green-400"><i class="fa-solid fa-share-nodes"></i></button>   </div>   </div>   </div>  ;
}

// ✅ Render Comment Section
function renderCommentSection(userName = "") {
return   <div class="bg-white/5 backdrop-blur-md rounded-xl p-4 text-sm text-gray-300 border border-white/10 mt-6 space-y-3">   <h2 class="text-green-300 font-semibold text-lg mb-2">Leave a Comment</h2>   <textarea id="comment-text" placeholder="Your comment..." class="w-full p-3 rounded-lg bg-green-900/20 border border-green-400 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400" rows="4"></textarea>   <input type="text" id="comment-name" placeholder="Full Name" class="w-full p-3 rounded-lg bg-green-900/20 border border-green-400 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400" value="${userName}">   <button id="submit-comment" class="px-4 py-2 bg-green-400 text-green-900 font-semibold rounded-lg hover:bg-green-500 transition">Submit</button>   </div>  ;
}

// ✅ Fetch and show post
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
const postKey = `post_${postId}`;  

postContainer.innerHTML = `  
  <img src="${imageUrl}" class="w-full h-64 object-cover rounded-xl mb-4">  
  <h1 class="text-2xl font-bold text-green-300 mb-3">${post.title.rendered}</h1>  
  <div class="prose-custom mb-6">${enhanceContent(post.content.rendered)}</div>  
  ${renderLikeSection(postKey, commentsCount, categories, authorName, post.date)}  
`;  

listenLikes(postKey);  

onAuthStateChanged(auth, user => {  
  const likeBtn = document.getElementById("like-btn");  
  if (user) {  
    likeBtn.addEventListener("click", () => toggleLike(postKey, user.uid));  

    // Render comment section with user name  
    postContainer.insertAdjacentHTML("beforeend", renderCommentSection(user.displayName || ""));  
    document.getElementById("submit-comment").addEventListener("click", () => submitComment(postKey, user.uid));  
  } else {  
    likeBtn.addEventListener("click", () => alert("Please log in to like posts."));  

    // Render comment section without prefilled name  
    postContainer.insertAdjacentHTML("beforeend", renderCommentSection(""));  
    document.getElementById("submit-comment").addEventListener("click", () => alert("Please log in to comment."));  
  }  

  // Bottom spacer to

