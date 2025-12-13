// api-posts.js
// Mục đích: Chứa logic thao tác dữ liệu, các hàm Mock CRUD cho module Posts.
// File này sẽ được import và gọi bởi posts.js (Lớp UI Logic).

// *****************************************************************
// 1. DỮ LIỆU MOCK (Mô phỏng Database và Hằng số)
// *****************************************************************

// Các Tags cố định
export const POST_TAGS = ["Lifestyle", "Journey", "Recipe", "Voucher"];

// Dữ liệu MOCK cho Media Library (Được export để dùng trong Media Modal)
export const mockMedia = [
    { id: 101, url: 'https://i.postimg.cc/L8gYp4t2/media-1.jpg', name: 'hamburger-cheese.jpg' },
    { id: 102, url: 'https://i.postimg.cc/Gpd2Nf0C/media-2.jpg', name: 'salad-fresh.jpg' },
    { id: 103, url: 'https://i.postimg.cc/1X9S34QZ/media-3.jpg', name: 'steak-plate.jpg' },
    { id: 104, url: 'https://i.postimg.cc/k47g213n/phovn.jpg', name: 'pho-vietnam.jpg' },
    { id: 105, url: 'https://i.postimg.cc/W3sL831w/media-5.jpg', name: 'coffee-cup.jpg' },
    { id: 106, url: 'https://i.postimg.cc/W12p6B33/media-6.jpg', name: 'pasta-dish.jpg' },
];

// Dữ liệu MOCK cho các bài viết (Biến trạng thái có thể thay đổi)
let mockPosts = [
    { 
        id: 1, 
        title: "Tuyệt đỉnh ẩm thực đường phố Việt Nam", 
        slug: "am-thuc-duong-pho-vn", 
        description: "Khám phá những món ăn ngon nhất và trải nghiệm văn hóa ẩm thực độc đáo của Việt Nam.", 
        content: [
            { type: 'heading', text: 'Phở - Món ăn quốc hồn quốc túy' },
            { type: 'paragraph', text: 'Phở là một món ăn truyền thống của Việt Nam, đồng thời được xem là một trong những món ăn tiêu biểu nhất cho nền ẩm thực Việt. Phở truyền thống thường là phở bò hoặc phở gà, với nước dùng ngọt thanh, bánh phở mềm và các loại rau thơm.' },
            { type: 'image', url: 'https://i.postimg.cc/k47g213n/phovn.jpg', caption: 'Phở bò thơm ngon.' },
            { type: 'heading', text: 'Bánh Mì - Sự kết hợp hoàn hảo' },
            { type: 'paragraph', text: 'Bánh mì là một loại thức ăn nhanh nổi tiếng, được mệnh danh là một trong những món sandwich ngon nhất thế giới. Với vỏ bánh giòn rụm và nhân đa dạng (thịt nướng, chả lụa, pate...), bánh mì dễ dàng chinh phục mọi thực khách.' },
        ], 
        thumbnail: "https://i.postimg.cc/g0K53M1K/thumb1.jpg", 
        status: "PUBLISHED", 
        publishedAt: "2025-12-05T10:00:00", 
        authorId: 1,
        authorName: "Boss Admin",
        views: 312,
        commentsCount: 15,
        tags: ["Recipe"] 
    },
    { 
        id: 2, 
        title: "Hướng dẫn tối ưu SEO cho người mới bắt đầu", 
        slug: "toi-uu-seo-newbie", 
        description: "Các bước cơ bản để tăng traffic tự nhiên cho blog của bạn.", 
        content: [
            { type: 'paragraph', text: 'SEO (Search Engine Optimization) là quá trình tối ưu hóa website để đạt được thứ hạng cao hơn trong kết quả tìm kiếm. Đây là một kỹ năng quan trọng cho bất kỳ blogger nào.' },
            { type: 'heading', text: 'Nghiên cứu từ khóa' },
            { type: 'paragraph', text: 'Luôn bắt đầu bằng việc tìm hiểu những gì người dùng đang tìm kiếm. Sử dụng các công cụ nghiên cứu từ khóa để tìm ra các từ khóa có lượng tìm kiếm cao và độ cạnh tranh thấp.' }
        ],
        thumbnail: "https://i.postimg.cc/T3YjX84t/thumb2.jpg", 
        status: "DRAFT", 
        publishedAt: null, 
        authorId: 1,
        authorName: "Boss Admin",
        views: 0,
        commentsCount: 0,
        tags: ["Lifestyle"] 
    },
    { 
        id: 3, 
        title: "Kế hoạch ra mắt sản phẩm mới Q1/2026", 
        slug: "ke-hoach-san-pham-q1", 
        description: "Chiến lược marketing và phân phối cho quý đầu năm sau.", 
        content: [
            { type: 'paragraph', text: 'Việc ra mắt sản phẩm cần một chiến lược bài bản từ A đến Z. Đảm bảo mọi bộ phận đều đồng bộ về mục tiêu và timeline.' },
            { type: 'paragraph', text: 'Giai đoạn 1: Pre-launch buzz (Tạo tiếng vang trước ra mắt)' },
        ], 
        thumbnail: null, 
        status: "SCHEDULED", 
        publishedAt: "2026-01-15T09:30:00", 
        authorId: 2,
        authorName: "Eli Reviewer",
        views: 50,
        commentsCount: 2,
        tags: ["Voucher"] 
    },
];


// *****************************************************************
// 2. CÁC HÀM TIỆN ÍCH NỘI BỘ (Internal Utilities)
// *****************************************************************

/**
 * Xác định trạng thái của bài viết dựa trên publishedAt (Lấy từ logic của bạn)
 * @param {string | null} publishedAt 
 * @param {string | null} currentStatus
 * @returns {string} DRAFT | SCHEDULED | PUBLISHED
 */
function determinePostStatus(publishedAt, currentStatus) {
    if (currentStatus === 'PUBLISHED') {
        if (!publishedAt) return 'DRAFT';
        return 'PUBLISHED';
    }
    
    if (publishedAt) {
        const publishDate = new Date(publishedAt).getTime();
        if (publishDate > Date.now()) {
            return 'SCHEDULED';
        } else {
            return 'PUBLISHED'; 
        }
    }
    return 'DRAFT';
}

/**
 * Cập nhật MOCK dữ liệu cho Dashboard trong localStorage (Lấy từ logic của bạn)
 * @param {Object} newPost 
 */
function mockDashboardUpdate(newPost) {
    const storedPosts = localStorage.getItem('mockRecentPosts');
    let posts = storedPosts ? JSON.parse(storedPosts) : [];
    
    const storedStats = localStorage.getItem('mockStats');
    let stats = storedStats ? JSON.parse(storedStats) : { totalPosts: 0, totalViews: 0, totalComments: 0, totalReactions: 0 };
    
    if (!posts.find(p => p.id === newPost.id)) {
        posts.push({
            id: newPost.id,
            title: newPost.title,
            views: newPost.views,
            publishedDate: newPost.publishedAt ? newPost.publishedAt.split('T')[0] : null
        });
        stats.totalPosts += 1;
    }
    
    localStorage.setItem('mockRecentPosts', JSON.stringify(posts));
    localStorage.setItem('mockStats', JSON.stringify(stats));
}


// *****************************************************************
// 3. CÁC HÀM API CHÍNH (EXPORTED FUNCTIONS)
// *****************************************************************

export const postsApi = {
    /**
     * READ: Lấy danh sách bài viết đã được lọc và sắp xếp.
     * @param {string} searchTerm
     * @param {string} filterStatus
     * @param {string} filterTag
     * @returns {Promise<Array>} Danh sách bài viết đã lọc
     */
    getPosts: (searchTerm = '', filterStatus = 'all', filterTag = 'all') => {
        // --- Mô phỏng độ trễ API ---
        return new Promise(resolve => {
            setTimeout(() => {
                let filteredPosts = mockPosts;

                // 1. Lọc theo trạng thái
                if (filterStatus !== 'all') {
                    filteredPosts = filteredPosts.filter(post => post.status === filterStatus);
                }

                // 2. Lọc theo Tag
                if (filterTag !== 'all') {
                    filteredPosts = filteredPosts.filter(post => post.tags && post.tags.length > 0 && post.tags[0] === filterTag);
                }

                // 3. Tìm kiếm theo Tiêu đề/Slug
                if (searchTerm) {
                    const lowerSearchTerm = searchTerm.toLowerCase().trim();
                    filteredPosts = filteredPosts.filter(post => 
                        post.title.toLowerCase().includes(lowerSearchTerm) || 
                        post.slug.toLowerCase().includes(lowerSearchTerm)
                    );
                }
                
                // Sắp xếp: Mới nhất lên đầu (theo ID)
                filteredPosts.sort((a, b) => b.id - a.id); 

                resolve(filteredPosts);
            }, 300); // Thêm độ trễ 300ms để mô phỏng gọi API
        });
    },

    /**
     * READ: Lấy một bài viết theo ID
     * @param {number} id
     * @returns {Promise<Object | null>} Bài viết
     */
    getPostById: (id) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const post = mockPosts.find(p => p.id === id);
                resolve(post || null);
            }, 100);
        });
    },

    /**
     * CREATE/UPDATE: Lưu bài viết mới hoặc cập nhật bài viết hiện có
     * @param {Object} postData Dữ liệu bài viết
     * @param {number | null} postId ID của bài viết (null nếu là tạo mới)
     * @returns {Promise<Object>} Bài viết đã được lưu
     */
    savePost: (postData, postId = null) => {
        return new Promise((resolve, reject) => {
             setTimeout(() => {
                // Kiểm tra nội dung (giữ lại logic validate cơ bản của bạn)
                if (postData.content.length === 0) {
                    reject(new Error('Nội dung bài viết không được để trống.'));
                    return;
                }
                 
                // Xác định Status mới
                const currentStatus = postId ? mockPosts.find(p => p.id === postId)?.status : null;
                postData.status = determinePostStatus(postData.publishedAt, currentStatus);

                if (postId) {
                    // Cập nhật (Edit)
                    const index = mockPosts.findIndex(p => p.id === postId);
                    if (index !== -1) {
                        // Giữ lại các trường không thay đổi từ FE (views, commentsCount)
                        mockPosts[index] = { 
                            ...mockPosts[index], 
                            ...postData,
                            id: postId // Đảm bảo ID không thay đổi
                        };
                        console.log("Cập nhật bài viết MOCK:", mockPosts[index]);
                        resolve(mockPosts[index]);
                    } else {
                         reject(new Error(`Không tìm thấy bài viết ID: ${postId}`));
                    }
                } else {
                    // Tạo mới (Create)
                    const newId = Math.max(...mockPosts.map(p => p.id), 0) + 1;
                    const newPost = { 
                        id: newId, 
                        ...postData,
                        views: 0,
                        commentsCount: 0,
                        authorId: 1, 
                        authorName: "Boss Admin",
                    };
                    
                    mockPosts.push(newPost);
                    console.log("Tạo bài viết mới MOCK:", newPost);
                    resolve(newPost);
                }
            }, 500);
        });
    },

    /**
     * UPDATE: Publish / Unpublish / Schedule bài viết
     * @param {number} id ID bài viết
     * @param {string} currentStatus Trạng thái hiện tại
     * @returns {Promise<Object>} Bài viết đã cập nhật
     */
    togglePublish: (id, currentStatus) => {
         return new Promise((resolve, reject) => {
            const post = mockPosts.find(p => p.id === id);
            if (!post) {
                reject(new Error(`Không tìm thấy bài viết ID: ${id}`));
                return;
            }
            
            let statusMessage = '';

            if (currentStatus === 'PUBLISHED') {
                // Unpublish -> Draft
                post.status = 'DRAFT';
                post.publishedAt = null;
                statusMessage = `Đã Unpublish bài viết: "${post.title}"`;
            } else {
                // Draft/Scheduled -> PUBLISH NGAY (hoặc Schedule)
                if (post.publishedAt) {
                    const publishDate = new Date(post.publishedAt);
                    if (publishDate.getTime() > Date.now()) {
                        // Có lịch hẹn trong tương lai -> Chỉ đổi status thành SCHEDULED
                        post.status = 'SCHEDULED';
                        statusMessage = `Đã lên lịch xuất bản bài viết: "${post.title}" vào ${publishDate.toLocaleString()}`;
                    } else {
                        // Đặt lịch trong quá khứ/hiện tại -> Publish ngay
                        post.status = 'PUBLISHED';
                        post.publishedAt = new Date().toISOString();
                        statusMessage = `🎉 Bài viết "${post.title}" đã được PUBLISH!`;
                        mockDashboardUpdate(post); // Tích hợp Dashboard Mock
                    }
                } else {
                    // Publish ngay lập tức (Không có lịch hẹn)
                    post.status = 'PUBLISHED';
                    post.publishedAt = new Date().toISOString();
                    statusMessage = `🎉 Bài viết "${post.title}" đã được PUBLISH!`;
                    mockDashboardUpdate(post); // Tích hợp Dashboard Mock
                }
            }
            
            resolve({ post, message: statusMessage });
        });
    },

    /**
     * DELETE: Xóa bài viết
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    deletePost: (id) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = mockPosts.length;
                mockPosts = mockPosts.filter(p => p.id !== id);
                resolve(mockPosts.length < initialLength);
            }, 100);
        });
    }
};