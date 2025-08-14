// Glassmorphic Premium Header
document.getElementById("shared-header").innerHTML = `
  <header class="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
      <a href="index.html" class="flex items-center gap-2 text-2xl font-bold text-green-300 hover:text-teal-300 transition">
        <i class="fas fa-leaf"></i> TamilGeo
      </a>
      <nav class="hidden md:flex gap-6 text-white/80">
        <a href="index.html" class="hover:text-green-300 transition">Home</a>
        <a href="#" class="hover:text-green-300 transition">Categories</a>
        <a href="#" class="hover:text-green-300 transition">About</a>
      </nav>
      <div class="flex items-center gap-4">
        <button id="loginBtn" class="px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition">Login</button>
      </div>
    </div>
  </header>
`;
