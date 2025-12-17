/* =================================
   GLOBAL STATE - Lưu trạng thái app
================================= */
let menuAnimationInterval = null;
let instaAnimationInterval = null;

// Cache auth để không phải check lại liên tục
let authCache = {
  checked: false,      // Đã check chưa?
  isLoggedIn: false,   // Kết quả login
  timestamp: 0         // Thời gian check (để refresh sau 5 phút)
};

// Cache header để không load lại
let headerLoaded = false;

/* =================================
   UTILS & HELPERS
================================= */
function updateNavActiveState() {
  const links = document.querySelectorAll("#header nav a");
  if (!links.length) return;
  const currentPage = location.pathname.split("/").pop();
  links.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === currentPage);
  });
}

/* =================================
   LOGIN - Check 1 lần, dùng cache
================================= */
async function checkLoginStatus() {
  // Nếu đã check trong 5 phút → dùng cache
  const now = Date.now();
  if (authCache.checked && (now - authCache.timestamp < 300000)) {
    return authCache.isLoggedIn;
  }

  // Chưa có cache → check API
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) {
      authCache = { checked: true, isLoggedIn: false, timestamp: now };
      return false;
    }
    const data = await res.json();
    const loggedIn = !!data?.user;
    authCache = { checked: true, isLoggedIn: loggedIn, timestamp: now };
    return loggedIn;
  } catch (err) {
    console.error("Login check error:", err);
    authCache = { checked: true, isLoggedIn: false, timestamp: now };
    return false;
  }
}

// Cập nhật UI dựa trên login status
function updateUserUI(isLoggedIn) {
  document.body.classList.toggle("logged-in", isLoggedIn);
  
  // Header buttons
  const avatar = document.getElementById("user-avatar");
  const loginBtn = document.getElementById("login-btn");
  if (avatar) avatar.classList.toggle("hidden", !isLoggedIn);
  if (loginBtn) loginBtn.classList.toggle("hidden", isLoggedIn);

  // Page features (comment, post...)
  const displayStyle = isLoggedIn ? "block" : "none";
  document.querySelectorAll(".action-btn, .comment-form, .post-blog").forEach(el => {
    el.style.display = displayStyle;
  });
}

// Sync login status - CHỈ GỌI KHI CẦN THIẾT
async function syncUserStatus() {
  const isLoggedIn = await checkLoginStatus();
  updateUserUI(isLoggedIn);
}

/* =================================
   HEADER - Load 1 lần duy nhất
================================= */
async function loadHeader() {
  // Nếu đã load rồi → skip
  if (headerLoaded) return;

  const container = document.getElementById("header-container");
  if (!container) return;

  try {
    const res = await fetch("header-footer/header.html");
    const html = await res.text();
    container.innerHTML = html;
    
    headerLoaded = true; // Đánh dấu đã load
    
    initHeaderScrollLogic();
    updateNavActiveState();
    
    // Check login CHỈ 1 LẦN sau khi load header
    await syncUserStatus();
  } catch (err) {
    console.error("Header load error:", err);
  }
}

/* =================================
   HEADER SCROLL LOGIC
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

/* =================================
   ANIMATIONS
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
   SKELETON - Cho MỌI PAGE
================================= */
function showPageSkeleton() {
  const content = document.getElementById("content");
  if (!content) return;

  // Skeleton HTML chung cho mọi page
  content.innerHTML = `
    <div class="page-skeleton">
      <div class="skeleton-header" style="width:60%;height:40px;margin:20px auto;"></div>
      <div class="skeleton-content">
        <div class="skeleton-block" style="width:100%;height:200px;margin:20px 0;"></div>
        <div class="skeleton-block" style="width:100%;height:200px;margin:20px 0;"></div>
        <div class="skeleton-block" style="width:80%;height:150px;margin:20px 0;"></div>
      </div>
    </div>
  `;
}

/* =================================
   PAGE LIFECYCLE - Thống nhất cho mọi page
================================= */
function initPageLifecycle() {
  // 1. Update nav active state
  updateNavActiveState();
  
  // 2. Init header scroll
  initHeaderScrollLogic();
  
  // 3. Init animations nếu có
  if (document.querySelector(".menu-animation")) initMenuImageAnimation();
  if (document.querySelector(".insta-animation")) initInstaImageAnimation();
  
  // 4. Update user UI (dùng cache, không gọi API)
  updateUserUI(authCache.isLoggedIn);
  
  // 5. Scroll to top
  window.scrollTo(0, 0);
}

/* =================================
   SPA NAVIGATION
================================= */
async function fetchPageContent(url, contentArea) {
  // 1. Dừng animations
  stopAllAnimations();
  
  // 2. Hiện skeleton NGAY LẬP TỨC
  showPageSkeleton();
  
  // 3. Fetch page mới
  try {
    const res = await fetch(url);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const newContent = doc.getElementById("content");

    if (!newContent) {
      location.href = url; // Fallback
      return;
    }

    // 4. Update URL & Title
    document.title = doc.querySelector("title")?.textContent || "Elis' Favorite";
    history.pushState({}, "", url);

    // 5. Thay content
    contentArea.innerHTML = newContent.innerHTML;

    // 6. Chạy lifecycle thống nhất
    initPageLifecycle();

  } catch (err) {
    console.error("Fetch error:", err);
    location.href = url;
  }
}

/* =================================
   ROUTING - Bắt click links
================================= */
document.addEventListener("click", e => {
  const link = e.target.closest("a[href]");
  if (!link) return;
  
  const url = link.getAttribute("href");
  
  // Bỏ qua: anchor links, external links, new tabs
  if (!url || url.startsWith("#") || link.target === "_blank" || url.startsWith("http")) {
    return;
  }

  const content = document.getElementById("content");
  if (!content) return;

  e.preventDefault();
  fetchPageContent(url, content);
});

/* =================================
   INIT - Chạy khi page load
================================= */
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load header (chỉ 1 lần)
  await loadHeader();
  
  // 2. Init page hiện tại
  initPageLifecycle();
});

/* =================================
   BROWSER BACK/FORWARD
================================= */
window.addEventListener("popstate", () => {
  const content = document.getElementById("content");
  if (content) {
    fetchPageContent(location.href, content);
  }
});

/* =================================
   TAB VISIBILITY - Chỉ update UI, không check API
================================= */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // Chỉ re-init animation và nav, KHÔNG check login lại
    initPageLifecycle();
  }
});

/* =================================
   BF CACHE - Browser restore page
================================= */
window.addEventListener("pageshow", e => {
  if (e.persisted) {
    initPageLifecycle();
  }
});