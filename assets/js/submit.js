document.getElementById("postForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const postData = {
    title: document.getElementById("title").value,
    content: document.getElementById("content").value,
    image: document.getElementById("image").value
  };

  console.log("Post submitted:", postData);
  alert("Post submission simulated. Connect this form to a backend to save.");
});