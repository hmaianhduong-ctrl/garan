// api-comments.js
/**
 * ******************************************************
 * LỚP QUẢN LÝ API (LOGIC NGHIỆP VỤ) CHO COMMENTS
 * ******************************************************
 */

class CommentAPI {

    // ===============================
    // MOCK POSTS
    // ===============================
    #mockPosts = [
        { id: 1, title: "Tuyệt đỉnh ẩm thực đường phố Việt Nam", slug: "am-thuc-duong-pho-vn", commentsLocked: false },
        { id: 2, title: "Hướng dẫn tối ưu SEO cho người mới bắt đầu", slug: "toi-uu-seo-newbie", commentsLocked: true },
        { id: 3, title: "Kế hoạch ra mắt sản phẩm mới Q1/2026", slug: "ke-hoach-san-pham-q1", commentsLocked: false },
    ];

    // ===============================
    // MOCK COMMENTS
    // ===============================
    #mockComments = [
        { id: 101, postId: 1, postTitle: "Tuyệt đỉnh ẩm thực đường phố Việt Nam", author: "Nguyễn Văn A", content: "Bài viết rất hay, tôi rất thích món gà rán này!", createdAt: "2025-12-10T14:30:00", isHidden: false },
        { id: 102, postId: 1, postTitle: "Tuyệt đỉnh ẩm thực đường phố Việt Nam", author: "Anon User", content: "Thử rồi, chán, gà không giòn.", createdAt: "2025-12-10T15:01:00", isHidden: true },
        { id: 103, postId: 2, postTitle: "Hướng dẫn tối ưu SEO cho người mới bắt đầu", author: "Hoàng Thị B", content: "Cảm ơn tips SEO hữu ích của admin!", createdAt: "2025-12-11T09:15:00", isHidden: false },
        { id: 104, postId: 3, postTitle: "Kế hoạch ra mắt sản phẩm mới Q1/2026", author: "Lê C", content: "Mong chờ sản phẩm mới, hy vọng sẽ có ưu đãi.", createdAt: "2025-12-12T08:00:00", isHidden: false },
    ];

    // ===============================
    // POSTS
    // ===============================
    getMockPosts() {
        return this.#mockPosts;
    }

    getPostById(id) {
        return this.#mockPosts.find(p => p.id === id);
    }

    // ===============================
    // COMMENTS
    // ===============================
    getFilteredComments({ searchTerm = '', postId = 'all', status = 'all' } = {}) {
        let result = [...this.#mockComments];

        const pid = parseInt(postId);
        const term = searchTerm.toLowerCase().trim();

        if (pid && postId !== 'all') {
            result = result.filter(c => c.postId === pid);
        }

        if (status !== 'all') {
            const isHidden = status === 'HIDDEN';
            result = result.filter(c => c.isHidden === isHidden);
        }

        if (term) {
            result = result.filter(c =>
                c.content.toLowerCase().includes(term) ||
                c.author.toLowerCase().includes(term) ||
                c.postTitle.toLowerCase().includes(term)
            );
        }

        result.sort((a, b) => b.id - a.id);
        return result;
    }

    toggleHideComment(id, currentIsHidden) {
        const comment = this.#mockComments.find(c => c.id === id);
        if (!comment) return false;

        comment.isHidden = !currentIsHidden;
        return true;
    }

    deleteComment(id) {
        const before = this.#mockComments.length;
        this.#mockComments = this.#mockComments.filter(c => c.id !== id);
        return this.#mockComments.length < before;
    }
}

/* =====================================================
   EXPORT + GLOBAL FALLBACK (CỰC KỲ QUAN TRỌNG)
   ===================================================== */

// ES Module (dùng sau này nếu cần)
export const commentAPI = new CommentAPI();

// Legacy support – để comments.html KHÔNG PHẢI SỬA
if (typeof window !== 'undefined') {
    window.commentAPI = commentAPI;
}
