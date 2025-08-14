
async function loadPosts() {
  const container = document.getElementById("post-container");

  try {
    const res = await fetch("https://public-api.wordpress.com/rest/v1.1/sites/tamilgeo.wordpress.com/posts/");
    const data = await res.json();

    data.posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "blog-card";
      card.innerHTML = `
        <img src="${post.featured_image || 'assets/images/default.jpg'}" alt="${post.title}">
        <h3>${post.title}</h3>
        <p>${post.excerpt.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
        <a href="${post.URL}" target="_blank" class="btn">Read More</a>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading posts:", error);
    container.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
  }
}

loadPosts();
