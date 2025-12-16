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

  // 1. Reset UI (Đảm bảo tagList được reset trước khi render skeleton)
  container.innerHTML = "";
  tagList.innerHTML = "";

  // 2. LUÔN render skeleton trước
  renderSkeleton();

  if (newsDataCache) {
    // 3a. Có cache → render ngay
    renderNews(newsDataCache);

    // ✅ Hide skeleton SAU KHI render
    hideNewsSkeleton();
  } else {
    // 3b. Chưa có cache → fetch
    fetchNewsData();
  }
}

/* ---------------------------------
   HÀM XỬ LÝ DỮ LIỆU: Chuyển mảng phẳng từ API thành Object nhóm theo Tag
--------------------------------- */
function processPostsForNewsPage(postsArray) {
    const groupedData = {};
    
    // Đảm bảo dữ liệu nhận về là mảng
    if (!Array.isArray(postsArray)) {
        console.error("API did not return an array of posts.");
        return {};
    }

    postsArray.forEach(post => {
        // Giả sử API trả về trường 'tag' và 'publishedAt'
        const tag = post.tag || 'Uncategorized'; 
        
        if (!groupedData[tag]) {
            groupedData[tag] = [];
        }
        
        // Chuẩn hóa cấu trúc data cho frontend
        groupedData[tag].push({
            id: post.id,
            title: post.title,
            // Ưu tiên publishedAt (ISO format) hoặc fallback về date
            date: post.publishedAt || post.date, 
            image: post.thumbnail, 
            slug: post.slug 
        });
    });
    
    return groupedData; // Trả về Object: { "Lifestyle": [...], "Journey": [...] }
}


/* ---------- FETCH ---------- */
async function fetchNewsData() {
  try {
    // 💡 SỬA: Dùng API endpoint tương đối và không cần headers
    const res = await fetch("/api/posts"); 

    if (!res.ok) {
      throw new Error("API error: " + res.status);
    }
    
    // 1. Nhận mảng bài viết từ API
    const rawPosts = await res.json(); 
    
    // 2. Chuyển đổi mảng thành Object nhóm theo Tag
    const groupedData = processPostsForNewsPage(rawPosts); 
    
    newsDataCache = groupedData;

    // Không cần container.innerHTML = "" ở đây vì đã reset trong initNewsPage
    renderNews(groupedData); 
    hideNewsSkeleton();

  } catch (err) {
    console.error("❌ Failed to load news API", err);

    // Ẩn skeleton ngay cả khi lỗi
    hideNewsSkeleton();
  }
}

/* ---------------------------------
   HÀM HỖ TRỢ XỬ LÝ NGÀY THÁNG
   (Giữ lại logic cũ để đảm bảo tương thích nếu API trả về DD/MM/YYYY)
--------------------------------- */
function parseDateForBrowser(dateStr) {
    if (dateStr && typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        // Chuyển từ DD/MM/YYYY sang YYYY-MM-DD
        return `${parts[2]}-${parts[1]}-${parts[0]}`; 
    }
    return dateStr;
}

/* ---------- PROCESS & RENDER ---------- */
function renderNews(data) {
  const container = document.getElementById("news-container");
  const tagList = document.getElementById("tag-list");
  if (!container || !tagList) return;

  // Xóa nội dung Skeleton để chuẩn bị render nội dung thật
  container.innerHTML = "";
  tagList.innerHTML = "";


  const tags = Object.keys(data);

  // Render Tags
  tags.forEach(tagName => {
    const tagClassName = `tag-${tagName.toLowerCase()}`;
    tagList.appendChild(createTagElement(tagName, tagClassName));
  });

  // Render Sections
  tags.forEach(tagName => {
    const sortedItems = [...data[tagName]].sort(
      // Dùng hàm parseDateForBrowser để đảm bảo sắp xếp đúng
      (a, b) => new Date(parseDateForBrowser(b.date)).getTime() - new Date(parseDateForBrowser(a.date)).getTime()
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

  // 💡 CẬP NHẬT: Giữ nguyên trỏ đến blog.html dùng slug (theo yêu cầu)
  // Nếu bạn muốn dùng ID, hãy đổi thành `blog.html?id=${item.id}`
  if (link) link.href = `blog.html?slug=${item.slug}`; 
  if (img) {
    img.src = item.image;
    img.alt = item.title;
    img.loading = "lazy";
  }

  if (title) title.textContent = item.title;

  // Dùng hàm parseDateForBrowser trước khi định dạng
  const dateObject = new Date(parseDateForBrowser(item.date));
  
  const formattedDate = dateObject.toLocaleDateString("vi-VN", {
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

  // Bọc toàn bộ Skeleton trong một container dễ quản lý
  const skeletonWrapper = document.createElement("div");
  skeletonWrapper.id = "news-skeleton-wrapper"; 
  
  // Dùng các tag cố định cho skeleton
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

    skeletonWrapper.appendChild(grid);
  });
  
  container.appendChild(skeletonWrapper);
}

/* ---------- HIDE SKELETON (CHỈ GỌI KHI DATA ĐÃ RENDER) ---------- */
function hideNewsSkeleton() {
  const skeleton = document.getElementById("news-skeleton-wrapper");
  if (skeleton) {
    skeleton.style.display = 'none';
  }
}

window.initNewsPage = initNewsPage;