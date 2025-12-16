/* =================================
   NEWS PAGE SCRIPT – FIX SKELETON TIMING
================================= */

let newsDataCache = null;
document.addEventListener("DOMContentLoaded", function() {
  renderSkeleton()
});
/* ---------- INIT ---------- */
function initNewsPage() {
  const container = document.getElementById("news-container");
  const tagList = document.getElementById("tag-list");
  if (!container || !tagList) return;

  // 1. Reset UI
  container.innerHTML = "";
  tagList.innerHTML = "";

  // 2. LUÔN render skeleton trước
  renderSkeleton();

  if (newsDataCache) {
    // 3a. Có cache → render ngay
    container.innerHTML = "";
    renderNews(newsDataCache);

    // ✅ Hide skeleton SAU KHI render
    hideNewsSkeleton();
  } else {
    // 3b. Chưa có cache → fetch
    fetchNewsData();
  }
}

/* ---------- FETCH ---------- */
async function fetchNewsData() {
  try {
    const res = await fetch("news-data.json");
    const data = await res.json();
    newsDataCache = data;

    const container = document.getElementById("news-container");
    if (container) container.innerHTML = "";

    renderNews(data);

    // ✅ Hide skeleton SAU KHI render xong
    hideNewsSkeleton();

  } catch (err) {
    console.error("❌ Failed to load news data", err);
  }
}

/* ---------- PROCESS & RENDER ---------- */
function renderNews(data) {
  const container = document.getElementById("news-container");
  const tagList = document.getElementById("tag-list");
  if (!container || !tagList) return;

  const tags = Object.keys(data);

  // Render Tags
  tags.forEach(tagName => {
    const tagClassName = `tag-${tagName.toLowerCase()}`;
    tagList.appendChild(createTagElement(tagName, tagClassName));
  });

  // Render Sections
  tags.forEach(tagName => {
    const sortedItems = [...data[tagName]].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const topItems = sortedItems.slice(0, 3);
    const section = createTagSection(tagName, topItems);
    container.appendChild(section);
  });
}

/* ---------- UI HELPERS ---------- */
function createTagElement(tagName, className) {
  const div = document.createElement("div");
  div.className = `tag-item ${className}`;
  div.textContent = tagName;
  return div;
}

/* ---------- TAG SECTION ---------- */
function createTagSection(tagName, items) {
  const fragment = document.createDocumentFragment();

  const divider = document.createElement("div");
  divider.className = "news-divider";
  fragment.appendChild(divider);

  const grid = document.createElement("div");
  grid.className = "news-grid";

  items.forEach(item => {
    grid.appendChild(createNewsCard(item));
  });

  const NEWS_LIMIT = 3;
  const emptyCount = NEWS_LIMIT - items.length;
  for (let i = 0; i < emptyCount; i++) {
    const placeholder = document.createElement("div");
    placeholder.className = "news-card is-empty";
    placeholder.innerHTML = `<div class="empty-placeholder">Coming soon</div>`;
    grid.appendChild(placeholder);
  }

  fragment.appendChild(grid);
  return fragment;
}

/* ---------- CARD ---------- */
function createNewsCard(item) {
  const template = document.getElementById("news-card-template");
  const fragment = document.importNode(template.content, true);

  const link = fragment.querySelector(".news-card");
  const img = fragment.querySelector("img");
  const title = fragment.querySelector(".news-title");
  const date = fragment.querySelector(".news-date");

  if (link) link.href = item.url;
  if (img) {
    img.src = item.image;
    img.alt = item.title;
    img.loading = "lazy";
  }

  if (title) title.textContent = item.title;

  const formattedDate = new Date(item.date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  if (date) date.textContent = formattedDate;

  return fragment;
}

/* =================================
   SKELETON
================================= */
function renderSkeleton() {
  const container = document.getElementById("news-container");
  const tagList = document.getElementById("tag-list");
  if (!container || !tagList) return;

  container.innerHTML = "";
  tagList.innerHTML = "";

  ["Lifestyle", "Journey", "Recipe", "Voucher"].forEach(tag => {
    const tagDiv = document.createElement("div");
    tagDiv.className = `tag-item tag-${tag.toLowerCase()} skeleton`;
    tagDiv.style.width = "120px";
    tagDiv.style.height = "34px";
    tagDiv.style.margin = "10px 20px";
    tagList.appendChild(tagDiv);

    const grid = document.createElement("div");
    grid.className = "news-grid";

    for (let i = 0; i < 3; i++) {
      const card = document.createElement("div");
      card.className = "news-card skeleton-card";
      card.innerHTML = `
        <div class="skeleton-img"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      `;
      grid.appendChild(card);
    }

    container.appendChild(grid);
  });
}

/* ---------- HIDE SKELETON (CHỈ GỌI KHI DATA ĐÃ RENDER) ---------- */
function hideNewsSkeleton() {
  document
    .querySelector(".news-skeleton")
    ?.classList.add("hidden");
}

window.initNewsPage = initNewsPage;
