// FILE: public/cms/js/posts.js
import { postsApi } from '../api/api-posts.js';

// --- CẤU HÌNH & BIẾN TOÀN CỤC ---
const POST_TAGS = ["Lifestyle", "Journey", "Recipe", "Voucher"];
let currentSearch = '';
let currentStatus = 'all';
let currentTag = 'all';

// --- KHỞI TẠO KHI TRANG WEB CHẠY ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 JS Posts đang chạy...");

    // 1. Gán sự kiện cho bộ lọc
    document.getElementById('search-input')?.addEventListener('input', (e) => { currentSearch = e.target.value; loadAndRenderPosts(); });
    document.getElementById('status-filter')?.addEventListener('change', (e) => { currentStatus = e.target.value; loadAndRenderPosts(); });
    document.getElementById('tag-filter')?.addEventListener('change', (e) => { currentTag = e.target.value; loadAndRenderPosts(); });

    // 2. Gán sự kiện cho các nút Modal (Quan trọng để nút bấm hoạt động)
    document.getElementById('add-post-btn')?.addEventListener('click', openCreateModal);
    document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
    document.getElementById('post-form')?.addEventListener('submit', handleFormSubmit);

    // 3. Render Tags vào Form tạo mới
    renderTagRadioButtons([]);

    // 4. Tải dữ liệu thật từ Server
    await loadAndRenderPosts();
});

// --- PHẦN 1: GỌI API & HIỂN THỊ DỮ LIỆU ---
async function loadAndRenderPosts() {
    const tableBody = document.getElementById('posts-table-body');
    const noDataMsg = document.getElementById('no-data-message');
    
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">⏳ Đang tải dữ liệu từ Database...</td></tr>';

    try {
        const posts = await postsApi.getPosts(currentSearch, currentStatus, currentTag);
        
        tableBody.innerHTML = ''; 
        if (!posts || posts.length === 0) {
            noDataMsg.classList.remove('hidden');
            return;
        } else {
            noDataMsg.classList.add('hidden');
        }

        posts.forEach(post => {
            const dateStr = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : '-';
            
            // Logic hiển thị Tag (nếu có)
            let tagDisplay = '<span class="text-xs text-gray-400">General</span>';
            // (Nếu sau này bạn lưu tags vào DB thì xử lý ở đây)

            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors';
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="text-sm font-semibold text-gray-900 line-clamp-1">${post.title}</div>
                    <div class="text-xs text-gray-500">${post.slug}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${tagDisplay}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="status-tag status-${post.status}">${post.status}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600"><span class="font-bold text-primary">${post.views || 0}</span> views</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${dateStr}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onclick="window.handleEditPost(${post.id})" class="text-blue-600 hover:text-blue-800 mx-1 p-2"><i class="fas fa-edit"></i></button>
                    <button onclick="window.handleDeletePost(${post.id})" class="text-red-500 hover:text-red-700 mx-1 p-2"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-red-500">❌ Lỗi kết nối Server!</td></tr>';
    }
}

// --- PHẦN 2: LOGIC GIAO DIỆN (MODAL, EDITOR...) ---

// Mở Modal Tạo Mới
function openCreateModal() {
    document.getElementById('post-form').reset();
    document.getElementById('post-id').value = '';
    document.getElementById('modal-title').innerText = 'Tạo Bài Viết Mới';
    document.getElementById('content-blocks-container').innerHTML = ''; // Xóa trắng editor cũ
    
    addContentBlock('paragraph'); // Thêm 1 block mặc định
    document.getElementById('post-modal').classList.remove('hidden');
}

// Đóng Modal
function closeModal() {
    document.getElementById('post-modal').classList.add('hidden');
}

// Xử lý nút Lưu (Submit Form)
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Lấy dữ liệu từ Form
    const postId = document.getElementById('post-id').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const thumbnail = document.getElementById('thumbnail').value;
    const publishedAt = document.getElementById('published-at').value || null;
    
    // Lấy nội dung từ Editor (Quan trọng!)
    const content = getContentDataFromEditor();
    if (content.length === 0) {
        alert('Vui lòng nhập ít nhất một khối nội dung.');
        return;
    }

    const postData = {
        title,
        description,
        thumbnail,
        content: JSON.stringify(content), // Chuyển content thành chuỗi JSON để lưu DB
        publishedAt,
        slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
    };

    try {
        alert("Đang gửi dữ liệu...");
        await postsApi.savePost(postData, postId || null);
        alert("Thành công!");
        closeModal();
        loadAndRenderPosts(); // Tải lại danh sách
    } catch (error) {
        alert("Lỗi: " + error.message);
    }
}

// --- PHẦN 3: LOGIC EDITOR (Soạn thảo nội dung) ---
// Giữ lại các hàm này để nút "Thêm đoạn văn", "Thêm ảnh" hoạt động

window.addContentBlock = function(type) {
    const container = document.getElementById('content-blocks-container');
    let innerHTML = '';
    
    if (type === 'paragraph') {
        innerHTML = `<textarea class="w-full p-3 border rounded-md focus:ring-primary focus:border-primary" rows="3" placeholder="Nhập nội dung đoạn văn..."></textarea>`;
    } else if (type === 'heading') {
        innerHTML = `<input type="text" class="w-full p-3 border rounded-md font-bold text-lg" placeholder="Nhập tiêu đề phụ...">`;
    } else if (type === 'image') {
        innerHTML = `<input type="url" class="w-full p-2 border rounded mb-2" placeholder="Dán link ảnh vào đây..."><input type="text" class="w-full p-2 border rounded text-sm" placeholder="Chú thích ảnh...">`;
    }

    const div = document.createElement('div');
    div.className = 'content-block p-4 border border-gray-200 rounded-lg bg-gray-50 mb-3 relative group hover:border-primary transition-colors';
    div.setAttribute('data-type', type);
    div.innerHTML = `
        ${innerHTML}
        <button type="button" onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(div);
}

function getContentDataFromEditor() {
    const blocks = [];
    const container = document.getElementById('content-blocks-container');
    Array.from(container.children).forEach(div => {
        const type = div.getAttribute('data-type');
        let data = { type };
        if (type === 'paragraph') data.text = div.querySelector('textarea').value;
        else if (type === 'heading') data.text = div.querySelector('input').value;
        else if (type === 'image') {
            data.url = div.querySelector('input[type="url"]').value;
            data.caption = div.querySelector('input[type="text"]').value;
        }
        if (data.text || data.url) blocks.push(data);
    });
    return blocks;
}

// --- PHẦN 4: HÀM GLOBAL (Để gọi từ HTML onclick) ---
window.handleDeletePost = async (id) => {
    if (confirm(`Bạn có chắc muốn xóa bài viết ID ${id}?`)) {
        await postsApi.deletePost(id);
        loadAndRenderPosts();
    }
};

window.handleEditPost = (id) => {
    alert("Tính năng Sửa đang cập nhật API cho ID: " + id);
    // Sau này bạn sẽ gọi API getPostById(id) rồi điền dữ liệu vào Form ở đây
};

function renderTagRadioButtons(tags) {
    const container = document.getElementById('tag-checkboxes');
    if(container) container.innerHTML = POST_TAGS.map(t => `<label class="mr-4"><input type="radio" name="tags" value="${t}"> ${t}</label>`).join('');
}