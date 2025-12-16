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

/**
 * Tải và render bài viết chi tiết dựa trên slug từ URL.
 */
async function loadBlog() {
    // ... (Phần logic tải và render Blog giữ nguyên) ...
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug"); 
    
    const blogTitleEl = document.querySelector("#blogTitle");
    const blogDescEl = document.querySelector("#blogDescription");
    const blogMetaEl = document.querySelector(".blog-meta");
    
    // Nếu không có slug, dừng lại và thông báo
    if (!slug) {
        blogTitleEl.textContent = "Lỗi: Không tìm thấy định danh bài viết (slug).";
        blogDescEl.style.display = 'none';
        blogMetaEl.style.display = 'none';
        return;
    }

    let blog;
    
    // 1. TẢI BÀI VIẾT CHI TIẾT TỪ API
    try {
        const API_DETAIL_URL = `/api/posts?slug=${slug}`; 
        const res = await fetch(API_DETAIL_URL);
        
        if (!res.ok) {
            throw new Error(`Lỗi tải API chi tiết: ${res.status}`);
        }

        const data = await res.json();
        blog = Array.isArray(data) ? data[0] : data; 

        if (!blog) throw new Error("Không tìm thấy bài viết (Null Data).");

    } catch (error) {
        console.error("❌ Lỗi tải bài viết chi tiết:", error);
        blogTitleEl.textContent = "Không thể tải nội dung bài viết.";
        blogDescEl.textContent = "Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.";
        if (blogMetaEl) blogMetaEl.style.display = 'none';
        return;
    }


    /* --- RENDER BLOG CHÍNH --- */
    
    document.querySelector("#heroImage").style.backgroundImage =
      `url(${blog.thumbnail})`; 

    blogTitleEl.textContent = blog.title;
    blogDescEl.textContent = blog.description;
    
    // Xử lý Tag
    const blogTagEl = document.querySelector("#blogTag");
    if (blogTagEl) {
        blogTagEl.textContent = blog.tag;
        blogTagEl.className = `blog-tag blog-tag-single tag-${(blog.tag || '').toLowerCase()}`;
    }
    
    // Xử lý Ngày tháng
    const dateObject = new Date(parseDateForBrowser(blog.publishedAt || blog.date));
    const formattedDate = dateObject.toLocaleDateString("vi-VN", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric" 
    });
    const blogDateEl = document.querySelector("#blogDate");
    if (blogDateEl) blogDateEl.textContent = formattedDate;

    // Cập nhật lượt view/like 
    const viewCountEl = document.querySelector("#viewCount");
    const likeCountEl = document.querySelector("#likeCount");
    if (viewCountEl) viewCountEl.textContent = blog.views || 0;
    if (likeCountEl) likeCountEl.textContent = blog.likes || 0;


    // CONTENT RENDER
    const container = document.querySelector("#blogContent");
    if (container) container.innerHTML = ''; 

    // Kiểm tra và render content block
    if (container && blog.content && Array.isArray(blog.content)) {
        blog.content.forEach(block => {
            const text = block.value || block.text || "";
            let el = null;

            if (block.type === "paragraph") {
                el = document.createElement("p");
                el.className = "blog-paragraph";
                el.innerHTML = text.replace(/\n/g, "<br>");
            } else if (block.type === "h2") {
                el = document.createElement("h2");
                el.className = "blog-subheader";
                el.textContent = text;
            } else if (block.type === "h3") {
                el = document.createElement("h3");
                el.className = "blog-subsubheader";
                el.textContent = text;
            } else if (block.type === "image" && block.value) {
                el = document.createElement("img");
                el.className = "blog-image";
                el.src = block.value;
            } else if (block.type === "list") {
                el = document.createElement("ul");
                el.className = "blog-list";
                const items = block.items || block.value || [];
                items.forEach(item => {
                    const li = document.createElement("li");
                    li.textContent = item;
                    el.appendChild(li);
                });
            }

            if (el) container.appendChild(el);
        });
    }

    /* ============================
       LOAD RECOMMEND
       ============================ */
    await loadRecommendedBlogs(slug);
}

/**
 * Tải và render các bài viết gợi ý (Recommend)
 */
async function loadRecommendedBlogs(currentSlug) {
    // ... (Phần logic tải và render Recommend giữ nguyên) ...
    const recommendBox = document.querySelector("#recommendContainer");
    if (!recommendBox) return;
    
    recommendBox.innerHTML = ''; 

    try {
        const res = await fetch("/api/posts"); 
        
        if (!res.ok) throw new Error("Lỗi tải danh sách recommend.");
        
        const blogsList = await res.json();
        
        if (!Array.isArray(blogsList)) throw new Error("API Recommend không trả về mảng.");

        blogsList
            .filter(b => b.slug !== currentSlug) 
            .slice(0, 3) 
            .forEach(b => {
                const dateObject = new Date(parseDateForBrowser(b.publishedAt || b.date));
                const formattedDate = dateObject.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
                
                recommendBox.innerHTML += `
                    <a href="blog.html?slug=${b.slug}" class="bcard"> 
                        <div class="bcard-thumb-wrapper">
                            <img src="${b.thumbnail}" alt="" class="bcard-thumb">
                        </div>

                        <h3 class="bcard-title">${b.title}</h3>

                        <div class="bcard-meta">
                            <span class="bcard-tag tag-${(b.tag || '').toLowerCase()}">${b.tag}</span>

                            <div class="bcard-date">
                                <span class="date-text">Published</span>
                                <span class="date-value">${formattedDate}</span>
                            </div>
                        </div>

                    </a>
                `;
            });
    } catch (e) {
        console.warn("Không tải được bài viết gợi ý:", e);
        recommendBox.innerHTML = '<p class="recommend-error">Không có bài viết gợi ý.</p>';
    }
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
    // 1. Nút Like
    document.getElementById("likeBtn")?.addEventListener("click", e => {
        if (!isLoggedIn()) {
            e.preventDefault();
            // showLoginPopup() được định nghĩa trong login-popup.js
            showLoginPopup(); 
            return;
        }

        // 💡 GỌI HÀM XỬ LÝ LIKE GIẢ LẬP KHI ĐÃ ĐĂNG NHẬP
        handleLikeToggleFE(); 
        
        // TODO: gọi API like thực tế
        console.log("✅ Đã đăng nhập, tiến hành gọi API Like.");
    });

    // 2. Nút Đăng tải bình luận
    document.querySelector(".comment-submit-btn")?.addEventListener("click", e => {
        if (!isLoggedIn()) {
            e.preventDefault();
            showLoginPopup();
            return;
        }

        // TODO: submit comment
        console.log("✅ Đã đăng nhập, tiến hành submit comment.");
    });
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