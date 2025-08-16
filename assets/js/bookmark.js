// 📌 Get container where bookmarks will be shown
const container = document.getElementById("bookmarks-container");

// 📌 Load bookmarks on page load
document.addEventListener("DOMContentLoaded", loadBookmarks);

// ✅ Load bookmarks from localStorage
function loadBookmarks() {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  if (bookmarks.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-400">No bookmarks saved yet.</p>`;
    return;
  }

  container.innerHTML = ""; // Clear before re-render
  bookmarks.forEach(b => displayBookmark(b));
}

// ✅ Render a single bookmark card
function displayBookmark(bookmark) {
  container.innerHTML += `
    <div class="relative card rounded-xl overflow-hidden shadow-lg mb-4" id="bookmark-${bookmark.id}">
      <a href="${bookmark.url}" class="block">
        <div class="p-4">
          <h2 class="text-lg font-bold text-green-300 mb-2">${bookmark.title}</h2>
          <p class="text-sm text-gray-400">Saved bookmark</p>
        </div>
      </a>
      <button onclick="deleteBookmark(${bookmark.id})" 
              class="absolute top-2 right-2 text-red-400 hover:text-red-600">
        <i class="fa fa-trash"></i>
      </button>
    </div>
  `;
}

// ✅ Delete a bookmark
function deleteBookmark(id) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  bookmarks = bookmarks.filter(b => b.id !== id);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  // Refresh UI
  loadBookmarks();
}