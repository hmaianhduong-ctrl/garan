// FILE: public/cms/api/api-posts.js
// Mục đích: Gọi API thực tế từ Next.js Backend.

// 1. HẰNG SỐ
export const POST_TAGS = ["Lifestyle", "Journey", "Recipe", "Voucher"];

// Giữ lại Mock Media để test giao diện chọn ảnh
export const mockMedia = [
    { id: 101, url: 'https://i.postimg.cc/L8gYp4t2/media-1.jpg', name: 'hamburger.jpg' },
    { id: 102, url: 'https://i.postimg.cc/Gpd2Nf0C/media-2.jpg', name: 'salad.jpg' },
    { id: 103, url: 'https://i.postimg.cc/k47g213n/phovn.jpg', name: 'pho.jpg' },
];

// 2. CÁC HÀM API KẾT NỐI SERVER (QUAN TRỌNG)
export const postsApi = {
    
    // Lấy danh sách (Có lọc)
    getPosts: async (searchTerm = '', filterStatus = 'all', filterTag = 'all') => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus !== 'all') params.append('status', filterStatus);
            // Backend chưa xử lý lọc tag, nhưng cứ gửi lên
            if (filterTag !== 'all') params.append('tag', filterTag);

            // 👇 GỌI VỀ BACKEND CỦA BẠN
            const response = await fetch(`/api/posts?${params.toString()}`);
            if (!response.ok) throw new Error('Lỗi tải danh sách');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    // Lấy chi tiết 1 bài
    getPostById: async (id) => {
        try {
            const response = await fetch(`/api/posts/${id}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            return null;
        }
    },

    // Lưu bài viết (Tạo mới hoặc Sửa)
    savePost: async (postData, postId = null) => {
        const method = postId ? 'PUT' : 'POST';
        const url = postId ? `/api/posts/${postId}` : '/api/posts';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Lỗi khi lưu');
        }
        return await response.json();
    },

    // Đổi trạng thái nhanh (Toggle Publish)
    togglePublish: async (id, currentStatus) => {
        let updates = {};
        let message = '';

        if (currentStatus === 'PUBLISHED') {
            updates = { status: 'DRAFT', publishedAt: null };
            message = 'Đã gỡ bài xuống nháp.';
        } else {
            updates = { status: 'PUBLISHED', publishedAt: new Date().toISOString() };
            message = 'Đã xuất bản thành công!';
        }

        const response = await fetch(`/api/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Lỗi cập nhật trạng thái');
        return { message };
    },

    // Xóa bài viết
    deletePost: async (id) => {
        const response = await fetch(`/api/posts/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    }
};