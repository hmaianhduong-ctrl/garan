/* =================================
   NEWS PAGE SCRIPT – CLEAN VERSION
   Tag = structure only (no click)
================================= */

let newsDataCache = null;

/* ---------- INIT ---------- */
function initNewsPage() {
  const container = document.getElementById("news-container");
  if (!container) return;

  container.innerHTML = "";
function initNewsPage() {
  const container = document.getElementById("news-container");
  if (!container) return;

  container.innerHTML = "";
  renderSkeleton(); // 👈 ĐẶT Ở ĐÂY

  if (newsDataCache) {
    container.innerHTML = ""; // xoá skeleton
    renderNews(newsDataCache);
  } else {
    fetchNewsData();
  }
}

  if (newsDataCache) {
    renderNews(newsDataCache);
  } else {
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
    if (container) container.innerHTML = ""; // 👈 clear skeleton

    renderNews(data);
  } catch (err) {
    console.error("❌ Failed to load news data", err);
  }
}

/* ---------- PROCESS & RENDER ---------- */
function renderNews(data) {
  const container = document.getElementById("news-container");
  if (!container) return;

  Object.keys(data).forEach(tagName => {
    // Sort newest first
    const sortedItems = [...data[tagName]].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Limit to 3 items
    const topItems = sortedItems.slice(0, 3);

    const section = createTagSection(tagName, topItems);
    container.appendChild(section);
  });
}

/* ---------- TAG SECTION ---------- */
function createTagSection(tagName, items) {
  const section = document.createElement("section");
  section.className = "news-category";

  const title = document.createElement("h2");
  title.className = "news-category-title";
  title.textContent = tagName;

  const grid = document.createElement("div");
  grid.className = "news-grid";

  items.forEach(item => {
    grid.appendChild(createNewsCard(item));
  });

  section.appendChild(title);
  section.appendChild(grid);

  return section;
}

/* ---------- CARD ---------- */
function createNewsCard(item) {
  const template = document.getElementById("news-card-template");
  const fragment = document.importNode(template.content, true);

  const link = fragment.querySelector(".news-card");
  const img = fragment.querySelector("img");
  const title = fragment.querySelector(".news-title");
  const date = fragment.querySelector(".news-date");

  link.href = item.url;               // 👉 click vào blog
  img.src = item.image;
  img.alt = item.title;
  img.loading = "lazy";               // ✅ lazy load

  title.textContent = item.title;
  date.textContent = new Date(item.date).toLocaleDateString("vi-VN");

  return fragment;
}

/* =================================
   script.js will call initNewsPage()
================================= */
function renderSkeleton() {
  const container = document.getElementById("news-container");
  if (!container) return;

  container.innerHTML = "";

  ["Lifestyle", "Journey", "Recipe", "Voucher"].forEach(tag => {
    const section = document.createElement("section");
    section.className = "news-category skeleton";

    const title = document.createElement("h2");
    title.className = "news-category-title";
	title.classList.add("skeleton-title");
	title.textContent = "";

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

    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
  });
}
