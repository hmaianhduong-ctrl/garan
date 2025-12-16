/* =================================
   GLOBAL STATE
================================= */
let menuAnimationInterval = null;
let instaAnimationInterval = null;

/* =================================
   UI READY BARRIER (CỰC QUAN TRỌNG)
================================= */
function whenUIReady($root, callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const images = $root.find("img").toArray();

      if (images.length === 0) {
        callback();
        return;
      }

      let loaded = 0;
      images.forEach(img => {
        if (img.complete) {
          loaded++;
          if (loaded === images.length) callback();
        } else {
          img.onload = img.onerror = () => {
            loaded++;
            if (loaded === images.length) callback();
          };
        }
      });
    });
  });
}

/* =================================
   HEADER LOGIC
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

  const page = window.location.pathname.split("/").pop();
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
   NAV + LIKE
================================= */
function updateNavActiveState() {
  const navLinks = document.querySelectorAll("header nav a");
  let currentPath = window.location.pathname.split("/").pop().split("?")[0];

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    link.classList.toggle(
      "active",
      href === currentPath ||
      (currentPath === "" && href === "index.html") ||
      (currentPath.startsWith("news.html") && href === "news.html")
    );
  });
}

function likeButtonToggle() {
  const btn = document.getElementById("likeBtn");
  const countElm = document.getElementById("likeCount");
  if (!btn || !countElm) return;

  let liked = btn.dataset.liked === "true";
  let count = parseInt(countElm.textContent) || 0;

  liked = !liked;
  btn.dataset.liked = liked;
  btn.innerHTML = liked
    ? '<i class="fa-solid fa-thumbs-up"></i>'
    : '<i class="fa-regular fa-thumbs-up"></i>';
  countElm.textContent = count + (liked ? 1 : -1);
}

function initLikeButton() {
  const btn = document.getElementById("likeBtn");
  if (!btn) return;
  btn.removeEventListener("click", likeButtonToggle);
  btn.addEventListener("click", likeButtonToggle);
}

/* =================================
   ANIMATION CONTROL
================================= */
function stopAllAnimations() {
  if (menuAnimationInterval) clearInterval(menuAnimationInterval);
  if (instaAnimationInterval) clearInterval(instaAnimationInterval);
  menuAnimationInterval = instaAnimationInterval = null;
}

function initMenuImageAnimation() {
  const img = document.querySelector(".menu-animation");
  if (!img) return stopAllAnimations();

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
   PAGE UPDATE
================================= */
function handlePageUpdate() {
  window.scrollTo(0, 0);
  updateNavActiveState();
  initHeaderScrollLogic();
  initLikeButton();
  initMenuImageAnimation();
  initInstaImageAnimation();
}

/* =================================
   SPA FETCH CORE (ĐÃ SỬA)
================================= */
async function fetchPageContent(url, contentArea) {
  stopAllAnimations();

  try {
    // 🔥 Nếu là NEWS → render skeleton NGAY
    if (url.includes("news.html")) {
      renderNewsSkeletonImmediately();
    }

    const html = await fetch(url).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");

    const newContent = doc.getElementById("content");
    if (!newContent) {
      window.location.href = url;
      return;
    }

    // ✅ Title update ngay
    document.title =
      doc.querySelector("title")?.textContent || "Elis’ Favorite";

    // --- CSS handling ---
    const oldCSS = document.head.querySelector("link[data-page-style]");
    const newCSS = doc.head.querySelector("link[data-page-style]");
    let cssPromise = Promise.resolve();

    if (newCSS && (!oldCSS || oldCSS.href !== newCSS.href)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = newCSS.href;
      link.dataset.pageStyle = "true";

      cssPromise = new Promise(r => {
        link.onload = r;
        link.onerror = r;
        document.head.appendChild(link);
      });
    }

    // 🚀 RENDER DOM NGAY – KHÔNG ĐỢI CSS
    contentArea.innerHTML = newContent.innerHTML;
    history.pushState({}, "", url);

    document.body.classList.add("page-loaded");

    // ⏳ CSS load ngầm
    cssPromise.then(() => {
      if (oldCSS && (!newCSS || oldCSS.href !== newCSS.href)) {
        oldCSS.remove();
      }
    });

    // ✅ ĐỢI UI PAINT XONG RỒI MỚI INIT
    whenUIReady($("#content"), () => {
      handlePageUpdate();

      if (url.includes("news.html") && window.initNewsPage) {
        window.initNewsPage();
      }
    });

  } catch (err) {
    console.error("SPA load error:", err);
    window.location.href = url;
  }
}

/* =================================
   ROUTING
================================= */
document.addEventListener("click", e => {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const url = link.getAttribute("href");
  if (!url || url.startsWith("#") || link.target === "_blank" || url.startsWith("http")) return;

  const content = document.getElementById("content");
  if (!content) return;

  e.preventDefault();
  document.body.classList.remove("page-loaded");

setTimeout(() => {
  if (url.includes("news.html")) {
    renderNewsSkeletonImmediately();
  }
  fetchPageContent(url, content);
}, 300);
});

window.addEventListener("popstate", () => {
  const content = document.getElementById("content");
  if (content) fetchPageContent(location.href, content);
});

/* =================================
   INIT
================================= */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-loaded");
  handlePageUpdate();
});

/* =================================
   HEADER LOAD
================================= */
function loadHeader() {
  const container = document.getElementById("header-container");
  if (!container) return;

  fetch("header-footer/header.html")
    .then(r => r.text())
    .then(html => {
      container.innerHTML = html;
      initHeaderScrollLogic();
      updateNavActiveState();
    });
}

document.addEventListener("DOMContentLoaded", loadHeader);
function renderNewsSkeletonImmediately() {
  const content = document.getElementById("content");
  if (!content) return;

  // Nếu đã có skeleton thì không render lại
  if (content.querySelector(".news-skeleton")) return;

  content.innerHTML = `
    <section class="news-page">
      <h1 id="news-title">Tin tức</h1>

      <div class="news-skeleton">
        ${Array.from({ length: 6 }).map(() => `
          <div class="skeleton-card">
            <div class="skeleton-thumb"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}
