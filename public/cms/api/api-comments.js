// public/api/api-comments.js
const API_BASE = '/app/api/comments'; // Đảm bảo backend của bạn chạy ở đường dẫn này

window.commentAPI = {
    // 1. Lấy tất cả comment
    getAllComments: async () => {
        try {
            const res = await fetch(API_BASE, { cache: 'no-store' });
            if (!res.ok) throw new Error('Lỗi tải dữ liệu');
            
            // Giả sử backend trả về mảng JSON
            const data = await res.json();
            
            // Map dữ liệu để khớp với giao diện (nếu backend chưa trả đúng format)
            // Lưu ý: Kiểm tra kỹ xem backend trả về field nào (post_title hay title)
            return data.map(item => ({
                ...item,
                postTitle: item.post?.title || item.postTitle || 'Không xác định' 
            }));
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    // 2. Ẩn/Hiện comment
    toggleHideComment: async (id, currentIsHidden) => {
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isHidden: !currentIsHidden }) // Đảo ngược trạng thái
            });
            return res.ok;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    // 3. Xóa comment
    deleteComment: async (id) => {
        try {
            const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
            return res.ok;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
};