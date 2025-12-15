/* =================================
   KHAI BÁO CÁC HÀM KHỞI TẠO CHUNG
================================= */
let menuAnimationInterval = null;
let instaAnimationInterval = null;

// Hàm xử lý cuộn Header/Logo
function headerScrollHandler() {
  const header = document.getElementById("header");
  const logo = document.getElementById("logo");
  // Sử dụng path tuyệt đối của logo để tránh lỗi khi chuyển trang
  const logoWhite = "https://i.postimg.cc/dDFmbrnX/logo-white.png"; // Dùng logo trắng của bạn
  const logoColor = "https://i.postimg.cc/7b4MF0XW/logo-colored.png";

  if (!header || !logo) return;

  if (window.scrollY > 550) {
    header.classList.add("scrolled");
    logo.src = logoColor; // Thay bằng logo màu
  } else {
    header.classList.remove("scrolled");
    logo.src = logoWhite; // Thay bằng logo trắng
  }
}

// Hàm khởi tạo logic cuộn Header/Logo
function initHeaderScrollLogic() {
  const header = document.getElementById("header");
  const logo = document.getElementById("logo");
  
  // ⚠️ Quan trọng: Xóa listener cũ trước
  window.removeEventListener("scroll", headerScrollHandler);

  const currentPage = window.location.pathname.split("/").pop();
  const isHomePage = (currentPage === "" || currentPage === "index.html");

  if (!header || !logo) return;

  if (isHomePage) {
    // ✅ HOME
    document.body.classList.remove("sticky-header");
    window.addEventListener("scroll", headerScrollHandler);
    // Gọi một lần để setup trạng thái ban đầu
    headerScrollHandler(); 
  } else {
    // ✅ PAGE PHỤ (Gán trạng thái cố định ngay)
    document.body.classList.add("sticky-header");
    header.classList.add("scrolled");
    // Sử dụng logo màu cho page phụ để nổi bật trên nền trắng (hoặc bất kỳ nền nào khác)
    logo.src = "https://i.postimg.cc/7b4MF0XW/logo-colored.png"; 
  }
}

// Logic chuyển đổi nút Like (Tách ra để dễ quản lý)
function likeButtonToggle() {
    const likeBtn = document.getElementById("likeBtn");
    const likeCountElm = document.getElementById("likeCount");
    
    if (!likeBtn || !likeCountElm) return;
    
    // Sử dụng thuộc tính data để lưu trạng thái
    let liked = likeBtn.dataset.liked === 'true';
    let likeCount = parseInt(likeCountElm.textContent, 10) || 0;
    
    liked = !liked;

    likeBtn.innerHTML = liked
      ? '<i class="fa-solid fa-thumbs-up"></i>'
      : '<i class="fa-regular fa-thumbs-up"></i>';

    likeCount += liked ? 1 : -1;
    likeCountElm.textContent = likeCount;
    likeBtn.dataset.liked = liked;
}

// Hàm khởi tạo logic nút Like
function initLikeButton() {
  const likeBtn = document.getElementById("likeBtn");

  if (likeBtn) {
    // Xóa listener cũ và thêm lại
    likeBtn.removeEventListener("click", likeButtonToggle); 
    likeBtn.addEventListener("click", likeButtonToggle);
  }
}


// Hàm khởi tạo logic gạch chân NAV
function updateNavActiveState() {
  const navLinks = document.querySelectorAll("header nav a");
  
  // Lấy đường dẫn hiện tại, loại bỏ query string
  let currentPath = window.location.pathname.split("/").pop();
  currentPath = currentPath.split("?")[0]; 

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    link.classList.remove("active"); 

    // Kiểm tra trang hiện tại và trang mặc định (index.html)
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    }
    // Xử lý trường hợp news.html có query param (ví dụ: news.html?category=...)
    if (currentPath.startsWith("news.html") && href === "news.html") {
         link.classList.add("active");
    }
  });
}


// Hàm dừng các hiệu ứng động khi chuyển trang
function stopAllAnimations() {
    if (menuAnimationInterval) {
        clearInterval(menuAnimationInterval);
        menuAnimationInterval = null;
    }
    if (instaAnimationInterval) {
        clearInterval(instaAnimationInterval);
        instaAnimationInterval = null;
    }
}


// Hàm xử lý các logic cần chạy lại sau khi nội dung được tải mới
function handlePageUpdate() {
    // 1. Cuộn lên đầu trang
    window.scrollTo(0, 0);

    // 2. Cập nhật trạng thái Active của Menu NAV
    updateNavActiveState();
    
    // 3. KHỞI TẠO LẠI LOGIC CUỘN HEADER
    initHeaderScrollLogic();
    
    // 4. KHỞI TẠO LẠI NÚT LIKE 
    initLikeButton(); 
    
    // 5. Kích hoạt lại các script nội dung (Animation)
    initMenuImageAnimation();
    initInstaImageAnimation();
}


// Hàm Fetch nội dung trang mới (Đã sửa lỗi tải CSS và Fade-in)
async function fetchPageContent(url, contentArea) {
    // ⚠️ QUAN TRỌNG: Dừng animation cũ trước khi DOM thay đổi
    stopAllAnimations(); 
    
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

        // --- Logic Xử lý CSS (Đã tối ưu) ---
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

                shouldRemoveOldCSS = true;
            }
        }

        await cssLoadPromise;

        // Nếu trang mới không có CSS đặc thù, loại bỏ CSS cũ (nếu có)
        if (!newCSSLinkFromDoc && currentCSSLink) {
          currentCSSLink.remove();
        }

        // Chỉ REMOVE CSS CŨ KHI ĐÃ APPEND CSS MỚI
        if (shouldRemoveOldCSS && currentCSSLink) {
            currentCSSLink.remove();
        }
        // --- Kết thúc Logic CSS ---

        // 4. THAY THẾ NỘI DUNG
        contentArea.innerHTML = newContent.innerHTML;

        // 5. Cập nhật URL
        window.history.pushState({}, '', url);

        // 6. FADE-IN SAU KHI DOM VÀ CSS SẴN SÀNG
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

// Xử lý nút Back/Forward của trình duyệt
window.addEventListener('popstate', (e) => {
    // Chỉ tải lại nếu có sự kiện popstate (người dùng bấm back/forward)
    const content = document.getElementById('content');
    if (content) {
        // Tải nội dung trang hiện tại từ history
        fetchPageContent(window.location.href, content);
    } else {
        window.location.reload();
    }
});


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


/* =================================
   LOGIC ANIMATION
================================= */

function initMenuImageAnimation() {
  const img = document.querySelector(".menu-animation");
  if (!img) {
    if (menuAnimationInterval) clearInterval(menuAnimationInterval);
    menuAnimationInterval = null;
    return;
  }

  const totalFrames = 8;
  const framePath = "home-user/menu-pic/menu-pic";
  let currentFrame = 1;

  // ❌ DỪNG interval cũ nếu có (Quan trọng)
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


function initInstaImageAnimation() {
  const img = document.querySelector(".insta-animation");
  if (!img) {
    if (instaAnimationInterval) clearInterval(instaAnimationInterval);
    instaAnimationInterval = null;
    return;
  }

  const totalFrames = 9;
  const framePath = "home-user/ins-pic/ins";
  let currentFrame = 1;

  // ❌ Clear interval cũ (Quan trọng)
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
  }, 1000); 
}

// Xử lý khi người dùng chuyển tab/cửa sổ
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAllAnimations();
  } else {
    // Khởi tạo lại animation khi tab/cửa sổ được focus lại
    initMenuImageAnimation();
    initInstaImageAnimation();
  }
});