function fetchPosts() {
  isLoading = true;

  fetch(`${blogURL}/posts?per_page=${postsPerPage}&page=${currentPage}&_embed=1`)
    .then(async res => {
      if (!res.ok) throw new Error(`Failed to fetch posts. Status: ${res.status}`);
      totalPages = parseInt(res.headers.get("X-WP-TotalPages")) || 1;
      return res.json();
    })
    .then(posts => {
      if (!Array.isArray(posts) || posts.length === 0) {
        container.innerHTML += `<p class="text-center col-span-full text-gray-400">No posts found.</p>`;
      } else {
        displayPosts(posts);
      }

      loadMoreBtn.style.display = currentPage >= totalPages ? "none" : "block";
      isLoading = false;
    })
    .catch(err => {
      console.error("Post Fetch Error:", err);
      container.innerHTML += `<p class="text-red-400">Error loading posts. Try again later.</p>`;
      isLoading = false;
    });
}

function displayPosts(posts) {
  const bookmarkedIds = JSON.parse(localStorage.getItem("bookmarkedPosts") || "[]");

  posts.forEach(post => {
    if (!post || !post.id || !post.title) return;

    let imageUrl = "";
    if (post.jetpack_featured_media_url) {
      imageUrl = post.jetpack_featured_media_url;
    } else if (post._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
      imageUrl = post._embedded["wp:featuredmedia"][0].source_url;
    }

    const image = imageUrl
      ? `<img src="${imageUrl}" class="w-full h-48 object-cover rounded-t-xl">`
      : `<div class="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400">No Image</div>`;

    const isBookmarked = bookmarkedIds.includes(post.id);
    const bookmarkBtn = `
      <button
        class="absolute top-3 right-3 rounded-full p-2 shadow-lg transition text-xl bookmark-btn ${isLoggedIn ? 'bg-white/20 hover:bg-green-400/40 text-green-300' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}"
        data-id="${post.id}"
        title="${isLoggedIn ? (isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks') : 'Login to Bookmark'}"
        ${isLoggedIn ? "" : "disabled"}
      >
        ${isBookmarked ? '✅' : '📌'}
      </button>`;

    container.innerHTML += `
      <div class="relative card rounded-xl overflow-hidden shadow-lg">
        <a href="post.html?id=${post.id}" class="block">
          ${image}
          <div class="p-4">
            <h2 class="text-lg font-bold text-green-300 mb-2">${post.title.rendered}</h2>
            <p class="text-sm text-gray-300 mb-2">${stripHTML(post.excerpt.rendered).slice(0, 100)}...</p>
            <div class="flex justify-between text-xs text-gray-400 mt-4">
              <span>👤 TamilGeo</span>
              <span>🗓️ ${timeAgo(post.date)}</span>
            </div>
          </div>
        </a>
        ${bookmarkBtn}
      </div>`;
  });

  if (isLoggedIn) attachBookmarkEvents();
}