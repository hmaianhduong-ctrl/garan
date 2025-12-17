/* =================================
   NEWS PAGE SCRIPT – CLEAN FINAL
================================= */

let newsDataCache = null;
window.initNewsPage = function () {
  const container = document.getElementById("news-container");
  if (!container) return;

  container.innerHTML = "";
  renderSkeleton();

  if (newsDataCache) {
    renderNews(newsDataCache);
    hideNewsSkeleton();
  } else {
    fetchNewsData();
  }
};



/* ---------------------------------
   DATA PROCESSING
--------------------------------- */
function processPostsForNewsPage(postsArray) {
  const groupedData = {};

  if (!Array.isArray(postsArray)) {
    console.error("API did not return an array");
    return groupedData;
  }

  postsArray.forEach(post => {
    const tag = post.tag || "Uncategorized";

    if (!groupedData[tag]) groupedData[tag] = [];

    groupedData[tag].push({
      id: post.id,
      title: post.title,
      date: post.publishedAt || post.date,
      image: post.thumbnail,
      slug: post.slug
    });
  });

  return groupedData;
}

/* ---------- FETCH ---------- */
async function fetchNewsData() {
  try {
    const res = await fetch("/api/posts");
    if (!res.ok) throw new Error(res.status);

    const rawPosts = await res.json();
    const groupedData = processPostsForNewsPage(rawPosts);

    newsDataCache = groupedData;
    renderNews(groupedData);
    hideNewsSkeleton();
  } catch (err) {
    console.error("❌ Failed to load news API", err);
    hideNewsSkeleton();
  }
}

/* ---------------------------------
   DATE PARSER
--------------------------------- */
function parseDateForBrowser(dateStr) {
  if (typeof dateStr === "string" && dateStr.includes("/")) {
    const [dd, mm, yyyy] = dateStr.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }
  return dateStr;
}

/* ---------------------------------
   RENDER NEWS
--------------------------------- */
function renderNews(data) {
  const container = document.getElementById("news-container");
  if (!container) return;

  container.innerHTML = "";

  Object.keys(data).forEach(tagName => {
    const sortedItems = [...data[tagName]].sort(
      (a, b) =>
        new Date(parseDateForBrowser(b.date)) -
        new Date(parseDateForBrowser(a.date))
    );

    const topItems = sortedItems.slice(0, 3);

    // Tag
    const tagEl = createTagElement(
      tagName,
      `tag-item tag-${tagName.toLowerCase()}`
    );

    container.appendChild(tagEl);

    // Divider
    const divider = document.createElement("div");
    divider.className = "news-divider";
    container.appendChild(divider);

    // Grid
    container.appendChild(createNewsGrid(topItems));
  });
}

/* ---------------------------------
   UI HELPERS
--------------------------------- */
function createTagElement(name, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = name;
  return div;
}

/* ---------- GRID ---------- */
function createNewsGrid(items = [], isSkeleton = false) {
  const grid = document.createElement("div");
  grid.className = isSkeleton
    ? "news-grid skeleton-grid"
    : "news-grid";

  if (isSkeleton) {
    for (let i = 0; i < 3; i++) {
      const card = document.createElement("div");
      card.className = "news-card skeleton-card";
      card.innerHTML = `
        <div class="skeleton-img"></div>
        <div class="skeleton-line full"></div>
        <div class="skeleton-line short"></div>
      `;
      grid.appendChild(card);
    }
    return grid;
  }

  items.forEach(item => {
    grid.appendChild(createNewsCard(item));
  });

  const emptyCount = 3 - items.length;
  for (let i = 0; i < emptyCount; i++) {
    const placeholder = document.createElement("div");
    placeholder.className = "news-card is-empty";
    placeholder.innerHTML = `<div class="empty-placeholder">Coming soon</div>`;
    grid.appendChild(placeholder);
  }

  return grid;
}

/* ---------- CARD ---------- */
function createNewsCard(item) {
  const template = document.getElementById("news-card-template");
  const fragment = document.importNode(template.content, true);

  const card = fragment.querySelector(".news-card");
  const img = fragment.querySelector("img");
  const title = fragment.querySelector(".news-title");
  const dateEl = fragment.querySelector(".news-date");

    card.href = `blog.html?slug=${item.slug}`;

  if (img) {
    img.src = item.image;
    img.alt = item.title;
    img.loading = "lazy";
  }

  if (title) title.textContent = item.title;

  if (dateEl) {
    const dateObj = new Date(parseDateForBrowser(item.date));
    dateEl.textContent = dateObj.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  return fragment;
}

/* =================================
   SKELETON
================================= */
function renderSkeleton() {
  const container = document.getElementById("news-container");
  if (!container) return;

  const wrapper = document.createElement("div");
  wrapper.id = "news-skeleton-wrapper";

  ["Lifestyle", "Journey", "Recipe", "Voucher"].forEach(tag => {
    const tagDiv = document.createElement("div");
    tagDiv.className = `tag-item tag-${tag.toLowerCase()} skeleton`;
    tagDiv.style.width = "120px";
    tagDiv.style.height = "34px";
    wrapper.appendChild(tagDiv);

    const divider = document.createElement("div");
    divider.className = "news-divider skeleton-divider";
    wrapper.appendChild(divider);

    wrapper.appendChild(createNewsGrid([], true));
  });

  container.appendChild(wrapper);
}

/* ---------- HIDE SKELETON ---------- */
function hideNewsSkeleton() {
  const el = document.getElementById("news-skeleton-wrapper");
  if (el) el.remove();
}
