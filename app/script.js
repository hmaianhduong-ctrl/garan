/* =================================
   GLOBAL STATE
================================= */
let menuAnimationInterval = null;
let instaAnimationInterval = null;
let skeletonTimer = null;

/* =================================
   UTILS
================================= */
function updateNavActiveState() {
  const links = document.querySelectorAll("#header nav a");
  if (!links.length) return;

  const currentPage = location.pathname.split("/").pop();

  links.forEach(link => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    // Nếu link khớp với trang hiện tại, gắn class active
    if (href === currentPage) {
      link.classList.add("active");
    }
  });
}

/* =================================
   UI READY BARRIER
================================= */
function whenUIReady($root, callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const images = $root.find("img").toArray();
      if (images.length === 0) return callback();

      let loaded = 0;
      images.forEach(img => {
        if (img.complete) {
          if (++loaded === images.length) callback();
        } else {
          img.onload = img.onerror = () => {
            if (++loaded === images.length) callback();
          };
        }
      });
    });
  });
}

/* =================================
   HEADER
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
   PAGE UPDATE
================================= */
function handlePageUpdate() {
  updateNavActiveState();
  initHeaderScrollLogic();

  if (document.querySelector(".menu-animation")) {
    initMenuImageAnimation();
  }

  if (document.querySelector(".insta-animation")) {
    initInstaImageAnimation();
  }
}

/* =================================
   NEWS SKELETON (SPA SAFE)
================================= */
function renderNewsSkeletonImmediately() {
  const newsContainer = document.querySelector("#news-container");
  if (!newsContainer) return;

  if (document.getElementById("news-skeleton-wrapper")) return;

  let html = "";
  ["Lifestyle", "Journey", "Recipe", "Voucher"].forEach(tag => {
    html += `
      <div class="tag-item tag-${tag.toLowerCase()} skeleton"
           style="width:120px;height:34px;"></div>
      <div class="news-divider skeleton-divider"></div>
      <div class="news-grid skeleton-grid">
        ${Array.from({ length: 3 }).map(() => `
          <div class="news-card skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-line full"></div>
            <div class="skeleton-line short"></div>
          </div>
        `).join("")}
      </div>
    `;
  });

  newsContainer.innerHTML = `
    <div id="news-skeleton-wrapper">
      ${html}
    </div>
  `;
}


/* =================================
   SPA FETCH CORE
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

    document.title =
      doc.querySelector("title")?.textContent || "Elis’ Favorite";


      contentArea.innerHTML = newContent.innerHTML;
    

    history.pushState({}, "", url);
    document.body.classList.add("page-loaded");

    whenUIReady($("#content"), () => {
      handlePageUpdate();

      // ✅ Update nav link active sau mỗi SPA page load
      updateNavActiveState();

      if (url.includes("news.html") && window.initNewsPage) {
        window.initNewsPage();
      }
    });


  } catch (err) {
    console.error("SPA error:", err);
    location.href = url;
  }
}

/* =================================
   ROUTING (SINGLE – CLEAN)
================================= */
document.addEventListener("click", e => {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const url = link.getAttribute("href");
  if (
    !url ||
    url.startsWith("#") ||
    link.target === "_blank" ||
    url.startsWith("http")
  ) return;

  const content = document.getElementById("content");
  if (!content) return;

  e.preventDefault();

  if (url.includes("news.html")) {
    content.innerHTML = `
      <section class="menu-page">
        <div class="news-page">
          <section class="news-title-section">
            <h1 class="flavors-stories">Flavors & stories</h1>
          </section>
          <section class="news-tags">
            <div id="news-container"></div>
          </section>
        </div>
      </section>
    `;
    renderNewsSkeletonImmediately();
  }

  fetchPageContent(url, content);
});

/* =================================
   INIT
================================= */
document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
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


