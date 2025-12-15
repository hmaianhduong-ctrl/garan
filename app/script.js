/* =================================
   KHAI BÁO CÁC HÀM KHỞI TẠO CHUNG
================================= */
let menuAnimationInterval = null;
let instaAnimationInterval = null;


// Hàm xử lý cuộn (Tách ra để dễ dàng thêm/xóa Listener)
function headerScrollHandler() {
  const header = document.getElementById("header");
  const logo = document.getElementById("logo");
  if (!header || !logo) return;

  if (window.scrollY > 550) {
    header.classList.add("scrolled");
    logo.src = "https://i.postimg.cc/nVjRQ1mp/chudo.png";
  } else {
    header.classList.remove("scrolled");
    logo.src = "https://i.postimg.cc/bYDC2Rnz/chutrang.png";
  }
}


// Hàm khởi tạo logic cuộn Header/Logo
function initHeaderScrollLogic() {
  const header = document.getElementById("header");
  const logo = document.getElementById("logo");

  window.removeEventListener("scroll", headerScrollHandler);

  const currentPage = window.location.pathname.split("/").pop();
  const isHomePage = (currentPage === "" || currentPage === "index.html");

  if (!header || !logo) return;

  if (isHomePage) {
    // ✅ HOME
    document.body.classList.remove("sticky-header");
    window.addEventListener("scroll", headerScrollHandler);
    headerScrollHandler();
  } else {
    // ✅ PAGE PHỤ
    document.body.classList.add("sticky-header");
    header.classList.add("scrolled");
    logo.src = "https://i.postimg.cc/7b4MF0XW/logo-colored.png";
  }
}


// Hàm khởi tạo logic nút Like
function initLikeButton() {
  const likeBtn = document.getElementById("likeBtn");
  const likeCountElm = document.getElementById("likeCount");

  if (likeBtn && likeCountElm) {
    // Xóa listener cũ (Đây là cách đơn giản, nếu ID không trùng, nó sẽ hoạt động tốt)
    likeBtn.removeEventListener("click", likeButtonToggle); 
    likeBtn.addEventListener("click", likeButtonToggle);
  }
}

// Logic chuyển đổi nút Like (Tách ra để dễ quản lý)
function likeButtonToggle() {
    const likeBtn = document.getElementById("likeBtn");
    const likeCountElm = document.getElementById("likeCount");
    
    // Sử dụng thuộc tính data để lưu trạng thái
    let liked = likeBtn.dataset.liked === 'true';
    let likeCount = parseInt(likeCountElm.textContent, 10);
    
    liked = !liked;

    likeBtn.innerHTML = liked
      ? '<i class="fa-solid fa-thumbs-up"></i>'
      : '<i class="fa-regular fa-thumbs-up"></i>';

    likeCount += liked ? 1 : -1;
    likeCountElm.textContent = likeCount;
    likeBtn.dataset.liked = liked;
}


// Hàm khởi tạo logic gạch chân NAV
function updateNavActiveState() {
  const navLinks = document.querySelectorAll("header nav a");
  const currentPage = window.location.pathname.split("/").pop();

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    link.classList.remove("active"); 

    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}


// Hàm xử lý các logic cần chạy lại sau khi nội dung được tải mới
function handlePageUpdate() {
    // 1. Cuộn lên đầu trang
    window.scrollTo(0, 0);

    // 2. Cập nhật trạng thái Active của Menu NAV
    updateNavActiveState();
    
    // 3. KHỞI TẠO LẠI LOGIC CUỘN HEADER
    initHeaderScrollLogic();
    
    // 4. KHỞI TẠO LẠI NÚT LIKE (hoặc bất kỳ script nào khác)
    initLikeButton(); 
    
    // 5. Kích hoạt lại các script nội dung (Video, Slider, v.v. - NẾU CÓ)
    // Ví dụ: initVideos();
    initMenuImageAnimation();
    initInstaImageAnimation();
}
// Hàm Fetch nội dung trang mới (Đã sửa lỗi tải CSS và Fade-in)
async function fetchPageContent(url, contentArea) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        const newContent = newDoc.getElementById('content');
        
        if (!newContent) {
            window.location.href = url;
            return; 
        }

const currentCSSLink = document.head.querySelector('link[data-page-style]');
const newCSSLinkFromDoc = newDoc.head.querySelector('link[data-page-style]');

let cssLoadPromise = Promise.resolve();
let shouldRemoveOldCSS = false;

if (newCSSLinkFromDoc) {
    const newHref = newCSSLinkFromDoc.getAttribute("href");

    if (!currentCSSLink || currentCSSLink.href !== newHref) {
        const newLink = document.createElement("link");
        newLink.rel = "stylesheet";
        newLink.href = newHref;
        newLink.dataset.pageStyle = "true";

        cssLoadPromise = new Promise(resolve => {
            newLink.onload = resolve;
            newLink.onerror = resolve;
            document.head.appendChild(newLink);
        });

        // ⚠️ ĐÁNH DẤU: có CSS mới thật sự
        shouldRemoveOldCSS = true;
    }
}

await cssLoadPromise;

if (!newCSSLinkFromDoc && currentCSSLink) {
  currentCSSLink.remove();
}

// ✅ CHỈ REMOVE KHI ĐÃ APPEND CSS MỚI
if (shouldRemoveOldCSS && currentCSSLink) {
    currentCSSLink.remove();
}

        // 4. THAY THẾ NỘI DUNG
        contentArea.innerHTML = newContent.innerHTML;

        // 5. Cập nhật URL
        window.history.pushState({}, '', url);

        // 6. FADE-IN SAU KHI DOM VÀ CSS SẴN SÀNG
        // Dùng requestAnimationFrame để đảm bảo trình duyệt đã vẽ nội dung mới
        requestAnimationFrame(() => {
            document.body.classList.add("page-loaded");
        });

        // 7. Kích hoạt lại các logic
        handlePageUpdate();

    } catch (error) {
        console.error("Lỗi khi tải trang AJAX:", error);
        window.location.href = url;
    }
}
/* =================================
   LOGIC PAGE TRANSITION & DOMContentLoaded
================================= */
// Thay thế khối này trong DOMContentLoaded:
// document.querySelectorAll("a[href]").forEach(link => { ... });

// Bằng khối Event Delegation sau:
document.addEventListener("click", e => {
  const link = e.target.closest("a[href]");
  if (!link) return; // Không phải là link, bỏ qua

  const url = link.getAttribute("href");

  if (
    !url ||
    url.startsWith("#") ||
    link.target === "_blank" ||
    url.startsWith("http") ||
    url.endsWith(".pdf") || 
    url.endsWith(".zip")
  ) return;

  // Lấy #content trước khi chuyển trang
  const content = document.getElementById('content'); 
  if (!content) {
      window.location.href = url;
      return;
  }
  
  e.preventDefault();

  // 1. Bắt đầu hiệu ứng Fade-out
  document.body.classList.remove("page-loaded");

  // 2. Chuyển hướng sau khi Fade-out hoàn tất (300ms)
  setTimeout(() => {
    fetchPageContent(url, content);
  }, 300);
});
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-loaded");
  handlePageUpdate();
});

function initMenuImageAnimation() {
  const img = document.querySelector(".menu-animation");
  if (!img) return;

  const totalFrames = 8;
  const framePath = "home-user/menu-pic/menu-pic";
  let currentFrame = 1;

  // ❌ DỪNG interval cũ nếu có
  if (menuAnimationInterval) {
    clearInterval(menuAnimationInterval);
    menuAnimationInterval = null;
  }

  // ✅ Preload ảnh cho mượt
  for (let i = 1; i <= totalFrames; i++) {
    const preloadImg = new Image();
    preloadImg.src = `${framePath}${i}.png`;
  }

  // ✅ Tạo interval MỚI
  menuAnimationInterval = setInterval(() => {
    currentFrame++;
    if (currentFrame > totalFrames) {
      currentFrame = 1;
    }
    img.src = `${framePath}${currentFrame}.png`;
  }, 1000);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden && menuAnimationInterval) {
    clearInterval(menuAnimationInterval);
  } else {
    initMenuImageAnimation();
    initInstaImageAnimation();
  }
});

function initInstaImageAnimation() {
  const img = document.querySelector(".insta-animation"); // ✅ ĐÚNG
  if (!img) return;

  const totalFrames = 9;
  const framePath = "home-user/ins-pic/ins";
  let currentFrame = 1;

  // ❌ Clear interval cũ
  if (instaAnimationInterval) {
    clearInterval(instaAnimationInterval);
    instaAnimationInterval = null;
  }

  // ✅ Preload ảnh
  for (let i = 1; i <= totalFrames; i++) {
    const preloadImg = new Image();
    preloadImg.src = `${framePath}${i}.png`;
  }

  // ✅ Animation loop
  instaAnimationInterval = setInterval(() => {
    currentFrame++;
    if (currentFrame > totalFrames) currentFrame = 1;
    img.src = `${framePath}${currentFrame}.png`;
  }, 1000); // tốc độ mượt hơn 1000ms
}
