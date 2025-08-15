// post.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, update, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
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

// DOM Elements
const featuredImage = document.getElementById("featured-image");
const postTitle = document.getElementById("post-title");
const postAuthor = document.getElementById("post-author");
const postDate = document.getElementById("post-date");
const postCategory = document.getElementById("post-category");
const postContent = document.getElementById("post-content");
const likeBtn = document.getElementById("likeBtn");
const likeCountEl = document.getElementById("likeCount");
const likedStatus = document.getElementById("likedStatus");
const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const commentName = document.getElementById("commentName");
const commentText = document.getElementById("commentText");

// Get postId from URL
const postId = new URLSearchParams(window.location.search).get('id');
if(!postId) { alert("Post ID missing"); throw new Error("Missing post ID"); }

// Load post data
async function loadPost() {
  try {
    const postRef = ref(db, `approvedPosts/${postId}`);
    const snapshot = await get(postRef);
    if(!snapshot.exists()) { 
      postTitle.textContent = "Post not found"; 
      return; 
    }
    const post = snapshot.val();

    // Featured image
    if(post.image) featuredImage.src = post.image;

    // Title, author, date, category
    postTitle.textContent = post.title;
    postAuthor.textContent = post.author;
    postDate.textContent = new Date(post.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
    postCategory.textContent = post.category;

    // Content with paragraph separation
    const paragraphs = post.content.split('<hr>').map(p => `<p>${p}</p>`).join('<hr>');
    postContent.innerHTML = paragraphs;

    // Likes
    if(!post.likes) post.likes = 0;
    likeCountEl.textContent = post.likes;

    // Load comments
    loadComments();
  } catch(err) {
    console.error(err);
  }
}

// Like button
likeBtn.addEventListener("click", async () => {
  try {
    const postRef = ref(db, `approvedPosts/${postId}/likes`);
    const snapshot = await get(postRef);
    const currentLikes = snapshot.exists() ? snapshot.val() : 0;
    await update(ref(db, `approvedPosts/${postId}`), { likes: currentLikes + 1 });
    likeCountEl.textContent = currentLikes + 1;
    likeBtn.classList.add('liked');
  } catch(err) {
    console.error(err);
  }
});

// Load comments
function loadComments() {
  const commentsRef = ref(db, `approvedPosts/${postId}/comments`);
  onValue(commentsRef, (snapshot) => {
    commentsList.innerHTML = '';
    snapshot.forEach(childSnap => {
      const comment = childSnap.val();
      const div = document.createElement('div');
      div.className = "border p-2 rounded bg-gray-50";
      div.innerHTML = `<strong>${comment.name}</strong> <span class="text-gray-500 text-sm">${new Date(comment.date).toLocaleString()}</span><p>${comment.text}</p>`;
      commentsList.appendChild(div);
    });
  });
}

// Submit comment
commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = commentName.value.trim();
  const text = commentText.value.trim();
  if(!name || !text) return;

  const commentData = {
    name,
    text,
    date: Date.now()
  };

  try {
    const commentsRef = ref(db, `approvedPosts/${postId}/comments`);
    await push(commentsRef, commentData);
    commentForm.reset();
  } catch(err) {
    console.error(err);
  }
});

// Initialize
loadPost();