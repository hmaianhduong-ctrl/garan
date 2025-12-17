
const API_BASE = "http://localhost:3000";

/* =================================
   BLOG DETAIL PAGE SCRIPT (blog.js)
   Tải bài viết chi tiết, bài gợi ý, và khởi tạo Pop-up
================================= */

// 💡 LƯU Ý: Hàm isLoggedIn() hiện tại chỉ là MOCK (giả lập)
// Nếu bạn đã chuyển isLoggedIn() sang script.js, hãy XÓA hàm này.
function isLoggedIn() {
    // Luôn trả về FALSE để TEST Pop-up.
    return false; 
}


/**
 * Hàm hỗ trợ xử lý ngày tháng
 */
function parseDateForBrowser(dateStr) {
    if (dateStr && typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`; 
    }
    return dateStr;
}

async function loadBlog() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const blogTitleEl = document.querySelector("#blogTitle");
  const blogDescEl = document.querySelector("#blogDescription");
  const blogMetaEl = document.querySelector(".blog-meta");

  if (!slug) {
    blogTitleEl.textContent = "Không tìm thấy bài viết.";
    blogDescEl.style.display = "none";
    blogMetaEl.style.display = "none";
    return;
  }

  let blog;

  try {
    // 1. LẤY LIST POST
    const res = await fetch(`${API_BASE}/api/posts`);
    if (!res.ok) throw new Error(res.status);

    const posts = await res.json();

    // 2. TÌM POST THEO SLUG
    blog = posts.find(p => p.slug === slug);
    if (!blog) throw new Error("Post not found");

    window.currentPostId = blog.id;

  } catch (err) {
    console.error("❌ Load blog failed:", err);
    blogTitleEl.textContent = "Không thể tải bài viết.";
    blogDescEl.textContent = "Vui lòng thử lại sau.";
    return;
  }

  /* ===== RENDER HERO ===== */
  document.querySelector("#heroImage").style.backgroundImage =
    `url(${blog.thumbnail})`;

  blogTitleEl.textContent = blog.title;
  blogDescEl.textContent = blog.description || "";

  /* ===== TAG ===== */
  const blogTagEl = document.querySelector("#blogTag");
  if (blogTagEl) {
    const firstTag = blog.tags?.[0] || "Uncategorized";
    blogTagEl.textContent = firstTag;
    blogTagEl.className = `blog-tag blog-tag-single tag-${firstTag.toLowerCase()}`;
  }

  /* ===== DATE ===== */
  const dateObj = new Date(blog.publishedAt || blog.createdAt);
  document.querySelector("#blogDate").textContent =
    dateObj.toLocaleDateString("vi-VN");

  /* ===== VIEW / LIKE ===== */
  document.querySelector("#viewCount").textContent = blog.views || 0;
  document.querySelector("#likeCount").textContent = blog.likes || 0;

  /* ===== CONTENT ===== */
  const container = document.querySelector("#blogContent");
  container.innerHTML = "";

  let contentBlocks = [];

  try {
    contentBlocks =
      typeof blog.content === "string"
        ? JSON.parse(blog.content)
        : blog.content;
  } catch {
    contentBlocks = [];
  }

  if (Array.isArray(contentBlocks)) {
    contentBlocks.forEach(block => {
      let el = null;

      if (block.type === "paragraph") {
        el = document.createElement("p");
        el.className = "blog-paragraph";
        el.innerHTML = (block.value || "").replace(/\n/g, "<br>");
      }

      if (block.type === "h2") {
        el = document.createElement("h2");
        el.className = "blog-subheader";
        el.textContent = block.value || "";
      }

      if (block.type === "image") {
        el = document.createElement("img");
        el.className = "blog-image";
        el.src = block.value;
      }

      if (el) container.appendChild(el);
    });
  }

  await loadRecommendedBlogs(slug);
    await loadComments(window.currentPostId);
}

/**
 * Tải và render các bài viết gợi ý (Recommend)
 */
async function loadRecommendedBlogs(currentSlug) {
  const box = document.querySelector("#recommendContainer");
  if (!box) return;

  box.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    const blogs = await res.json();

    blogs
      .filter(b => b.slug !== currentSlug)
      .slice(0, 3)
      .forEach(b => {
        const date = new Date(b.publishedAt || b.createdAt)
          .toLocaleDateString("vi-VN");

        box.innerHTML += `
          <a href="blog.html?slug=${b.slug}" class="bcard">
            <img src="${b.thumbnail}" />
            <h3>${b.title}</h3>
            <span>${date}</span>
          </a>
        `;
      });

  } catch (e) {
    box.innerHTML = "<p>Không có bài viết gợi ý.</p>";
  }
}

function renderComment({ author, content, createdAt }) {
  const list = document.getElementById("commentList");
  if (!list) return;

  const div = document.createElement("div");
  div.className = "comment-item";

  div.innerHTML = `
    <div class="comment-avatar">👤</div>
    <div class="comment-body">
      <div class="comment-author">${author}</div>
      <div class="comment-date">
        ${new Date(createdAt).toLocaleDateString("vi-VN")}
      </div>
      <div class="comment-content">${content}</div>
    </div>
  `;

  // animation nhẹ
  div.style.opacity = "0";
  div.style.transform = "translateY(10px)";
  list.prepend(div);

  requestAnimationFrame(() => {
    div.style.transition = "0.3s ease";
    div.style.opacity = "1";
    div.style.transform = "translateY(0)";
  });
}




// 💡 THÊM: Logic chuyển đổi trạng thái nút (Chỉ áp dụng khi đã đăng nhập)
function handleLikeToggleFE() {
  const btn = document.getElementById("likeBtn");
  const countElm = document.getElementById("likeCount");
  if (!btn || !countElm) return;

  let liked = btn.dataset.liked === "true";
  let count = parseInt(countElm.textContent) || 0;

  liked = !liked;
  btn.dataset.liked = liked;
  
  // 1. Cập nhật Icon
  btn.innerHTML = liked
    ? '<i class="fa-solid fa-thumbs-up"></i>'
    : '<i class="fa-regular fa-thumbs-up"></i>';
    
  // 2. Cập nhật số đếm
  countElm.textContent = count + (liked ? 1 : -1);
  
  // 3. TODO: Thay thế hai bước trên bằng API CALL thực tế
}


// 💡 SỬA: Logic gán sự kiện Like/Comment
function setupInteractiveActions() {

  // LIKE
  document.getElementById("likeBtn")?.addEventListener("click", e => {
    if (!isLoggedIn()) {
      e.preventDefault();
      showLoginPopup();
      return;
    }
    handleLikeToggleFE();
  });

  // COMMENT
  document.querySelector(".comment-submit-btn")
    ?.addEventListener("click", async e => {

      if (!isLoggedIn()) {
        e.preventDefault();
        showLoginPopup();
        return;
      }

      const textarea = document.querySelector(".comment-textarea");
      const content = textarea.value.trim();
      if (!content) return;

      // 👉 MOCK – backend chưa có
      const mockSavedComment = {
        author: "Bạn",
        content,
        createdAt: new Date().toISOString()
      };

      renderComment(mockSavedComment);
      textarea.value = "";

      // 🔜 Sau này bật lại API
      /*
      const res = await fetch(`${API_BASE}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: window.currentPostId,
          content
        })
      });

      const savedComment = await res.json();
      renderComment(savedComment);
      */
    });
}

async function loadComments(postId) {
  const list = document.getElementById("commentList");
  if (!list) return;

  list.innerHTML = "";

  // MOCK DATA – sau này thay bằng API GET
  const mockComments = [
    {
      author: "Admin",
      content: "Cảm ơn bạn đã đọc bài viết ❤️",
      createdAt: new Date().toISOString()
    }
  ];

  mockComments.forEach(renderComment);
}


// 💡 SỬA/THÊM: Hàm khởi tạo chính, đưa logic fetch Pop-up vào đây
function initBlogPageLogic() {
    
    // 1. Tải HTML Pop-up VÀ GÁN SỰ KIỆN (QUAN TRỌNG)
    fetch("login-popup.html") 
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById("login-popup-container");
            if(container) {
                container.innerHTML = html;
            } else {
                console.warn("Không tìm thấy div#login-popup-container.");
            }
            
            // 💡 QUAN TRỌNG: Chỉ gán sự kiện sau khi HTML của Pop-up đã được nhúng
            setupInteractiveActions(); 
            console.log("✅ Pop-up HTML đã được tải và sự kiện tương tác đã được gán.");
        })
        .catch(err => {
            console.error("❌ Lỗi tải login-popup.html. Kiểm tra lại đường dẫn file:", err);
            setupInteractiveActions(); 
        });

    // 2. Tải nội dung Blog (Có thể chạy song song với fetch)
    loadBlog();
}

// 💡 SỬA: Đảm bảo chỉ gọi initBlogPageLogic() MỘT LẦN khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", initBlogPageLogic);