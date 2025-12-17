/* =================================
   1. GLOBAL STATE
================================= */
let menuAnimationInterval = null;
let instaAnimationInterval = null;

/* =================================
   2. UTILS & HELPERS
================================= */
function updateNavActiveState() {
  const links = document.querySelectorAll("#header nav a");
  if (!links.length) return;
  const currentPage = location.pathname.split("/").pop();
  links.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === currentPage);
  });
}

function whenUIReady($root, callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const images = $root.find("img").toArray();
      if (images.length === 0) return callback();
      let loaded = 0;
      images.forEach(img => {
        if (img.complete) { if (++loaded === images.length) callback(); }
        else { img.onload = img.onerror = () => { if (++loaded === images.length) callback(); }; }
      });
    });
  });
}

/* =================================
   3. LOGIN & USER FEATURES (OPTIMIZED)
================================= */
async function checkLoginStatus() {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data?.user;
  } catch (err) {
    console.error("Login check error:", err);
    return false;
  }
}

// Hàm này cập nhật TẤT CẢ mọi thứ liên quan đến User (Header + Page Content)
function updateUserUI(isLoggedIn) {
  document.body.classList.toggle("logged-in", isLoggedIn);
  
  // 1. Cập nhật các nút trong Header (Avatar/Login)
  const avatar = document.getElementById("user-avatar");
  const loginBtn = document.getElementById("login-btn");
  if (avatar) avatar.classList.toggle("hidden", !isLoggedIn);
  if (loginBtn) loginBtn.classList.toggle("hidden", isLoggedIn);

  // 2. Cập nhật các tính năng trong trang (Comment/Post)
  const displayStyle = isLoggedIn ? "block" : "none";
  document.querySelectorAll(".action-btn, .comment-form, .post-blog").forEach(el => {
    el.style.display = displayStyle;
  });
}

// Chạy check login mà không block luồng chính
async function syncUserStatus() {
  const isLoggedIn = await checkLoginStatus();
  updateUserUI(isLoggedIn);
}

/* =================================
   4. HEADER LOGIC + SCROLL
================================= */
function headerScrollHandler() {
  const header = document.getElementById("header");
  const logo = document.getElementById("logo");
  if (!header || !logo) return;

  const logoWhite = "https://i.postimg.cc/dDFmbrnX/logo-white.png";
  const logoColor = "https://i.postimg.cc/7b4MF0XW/logo-colored.png";

  if (window.scrollY > 550) {
    header.classList.add("scrolled");
    logo.src = logoColor;
  } else {
    header.classList.remove("scrolled");
    logo.src = logoWhite;
  }
}

function initHeaderScrollLogic() {
  const header = document.getElementById("header");
  const logo = document.getElementById("logo");
  window.removeEventListener("scroll", headerScrollHandler);
  if (!header || !logo) return;

  const page = location.pathname.split("/").pop();
  const isHome = page === "" || page === "index.html";

  if (isHome) {
    document.body.classList.remove("sticky-header");
    window.addEventListener("scroll", headerScrollHandler);
    headerScrollHandler();
  } else {
    document.body.classList.add("sticky-header");
    header.classList.add("scrolled");
    logo.src = "https://i.postimg.cc/7b4MF0XW/logo-colored.png";
  }
}

function loadHeader() {
  const container = document.getElementById("header-container");
  if (!container) return;
  fetch("header-footer/header.html")
    .then(r => r.text())
    .then(html => {
      container.innerHTML = html;
      initHeaderScrollLogic();
      updateNavActiveState();
      // Sau khi load header xong, cần đồng bộ UI login cho header ngay
      syncUserStatus(); 
    });
}

/* =================================
   5. ANIMATIONS
================================= */
function stopAllAnimations() {
  if (menuAnimationInterval) clearInterval(menuAnimationInterval);
  if (instaAnimationInterval) clearInterval(instaAnimationInterval);
  menuAnimationInterval = instaAnimationInterval = null;
}

function initMenuImageAnimation() {
  const img = document.querySelector(".menu-animation");
  if (!img) return;
  const total = 8;
  const path = "home-user/menu-pic/menu-pic";
  let frame = 1;
  stopAllAnimations();
  menuAnimationInterval = setInterval(() => {
    frame = frame % total + 1;
    img.src = `${path}${frame}.png`;
  }, 1000);
}

function initInstaImageAnimation() {
  const img = document.querySelector(".insta-animation");
  if (!img) return;
  const total = 9;
  const path = "home-user/ins-pic/ins";
  let frame = 1;
  if (instaAnimationInterval) clearInterval(instaAnimationInterval);
  instaAnimationInterval = setInterval(() => {
    frame = frame % total + 1;
    img.src = `${path}${frame}.png`;
  }, 1000);
}

/* =================================
   6. PAGE UPDATE
================================= */
function handlePageUpdate() {
  updateNavActiveState();
  initHeaderScrollLogic();
  if (document.querySelector(".menu-animation")) initMenuImageAnimation();
  if (document.querySelector(".insta-animation")) initInstaImageAnimation();
}

function renderNewsSkeletonImmediately() {
  const newsContainer = document.querySelector("#news-container");
  if (!newsContainer || document.getElementById("news-skeleton-wrapper")) return;

  let html = "";
  ["Lifestyle", "Journey", "Recipe", "Voucher"].forEach(tag => {
    html += `
      <div class="tag-item tag-${tag.toLowerCase()} skeleton" style="width:120px;height:34px;"></div>
      <div class="news-divider skeleton-divider"></div>
      <div class="news-grid skeleton-grid">
        ${Array.from({ length: 3 }).map(() => `<div class="news-card skeleton-card"></div>`).join("")}
      </div>`;
  });
  newsContainer.innerHTML = `<div id="news-skeleton-wrapper">${html}</div>`;
}

/* =================================
   7. SPA FETCH CORE
================================= */
async function fetchPageContent(url, contentArea) {
  stopAllAnimations();
  try {
    const html = await fetch(url).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");
    const newContent = doc.getElementById("content");

    if (!newContent) {
      location.href = url;
      return;
    }

    document.title = doc.querySelector("title")?.textContent || "Elis’ Favorite";
    contentArea.innerHTML = newContent.innerHTML;
    history.pushState({}, "", url);
    document.body.classList.add("page-loaded");

    // Chạy đồng thời: Cập nhật UI User và Đợi ảnh load để chạy animation
    syncUserStatus(); 

    whenUIReady($(contentArea), () => {
      handlePageUpdate();
      if (url.includes("news.html") && window.initNewsPage) window.initNewsPage();
    });
  } catch (err) {
    console.error("SPA error:", err);
    location.href = url;
  }
}

/* =================================
   8. ROUTING CLICK HANDLER
================================= */
document.addEventListener("click", e => {
  const link = e.target.closest("a[href]");
  if (!link) return;
  const url = link.getAttribute("href");
  if (!url || url.startsWith("#") || link.target === "_blank" || url.startsWith("http")) return;

  const content = document.getElementById("content");
  if (!content) return;

  e.preventDefault();
  if (url.includes("news.html")) {
    content.innerHTML = `<div id="news-container"></div>`; // Simplified for example
    renderNewsSkeletonImmediately();
  }
  fetchPageContent(url, content);
});

/* =================================
   9. DOM LOADED INIT (NON-BLOCKING)
================================= */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Load Header (Trong loadHeader đã có gọi syncUserStatus)
  loadHeader();
  
  // 2. Chạy ngay logic giao diện của trang hiện tại
  document.body.classList.add("page-loaded");
  handlePageUpdate();

  // 3. Kiểm tra login cho các phần tử có sẵn trong body (nếu có)
  syncUserStatus();
});