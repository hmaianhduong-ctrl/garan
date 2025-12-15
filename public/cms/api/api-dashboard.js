// FILE: cms/api/api-dashboard.js (CHUYỂN SANG DÙNG API NEXT.JS)
/**
 * ******************************************************
 * DASHBOARD API – REAL API ADAPTER
 * ******************************************************
 */

(function () {
    const API_URL = '/api/dashboard';
    
    class DashboardAPI {
        /**
         * [GET] Lấy tất cả dữ liệu tổng quan và top post từ Server
         * Trả về cấu trúc: { summary: {...}, topPosts: [...] }
         */
        async getDashboardData() {
            try {
                const res = await fetch(API_URL, { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to fetch dashboard data');
                
                const data = await res.json();

                // Chuyển đổi định dạng dữ liệu trả về từ Server để phù hợp với Frontend cũ (nếu cần)
                return { 
                    posts: data.topPosts, 
                    stats: {
                        totalPosts: data.summary.posts, 
                        totalViews: data.summary.views,
                        totalComments: data.summary.comments,
                        totalReactions: data.summary.reactions,
                    }
                };

            } catch (error) {
                console.error("[DASHBOARD API ERROR]", error);
                // Trả về số 0 nếu lỗi để giao diện không bị crash
                return {
                    posts: [],
                    stats: { totalPosts: 0, totalViews: 0, totalComments: 0, totalReactions: 0 }
                };
            }
        }

        // GIỮ NGUYÊN MOCK DATA cho Biểu đồ (vì chúng ta chưa có API cho Views/Likes theo ngày)
        generateMockData(days) {
            const data = [];
            let date = new Date();
            date.setDate(date.getDate() - days + 1);

            for (let i = 0; i < days; i++) {
                const currentDate = new Date(date);
                const dateString = currentDate.toISOString().split('T')[0];

                const views = Math.floor(Math.random() * 2000) + 500;
                const likes = Math.floor(views * (Math.random() * 0.1 + 0.1));

                data.push({ date: dateString, views, likes });
                date.setDate(date.getDate() + 1);
            }
            return data;
        }

        // GIỮ NGUYÊN HÀM EXPORT MOCK DATA
        getExportMockData(selectedDate) {
            // ... (Giữ nguyên nội dung hàm này nếu bạn có) ...
            const [y, m, d] = selectedDate.split('-');
            const displayDate = `${d}/${m}/${y}`;
            const mockViewData = [{ time: '08:00', count: 50 }, { time: '12:00', count: 120 }, { time: '18:00', count: 200 }];
            const mockReactionData = [{ time: '09:00', type: 'Like', count: 15 }, { time: '14:00', type: 'Like', count: 30 }];
            return { displayDate, mockViewData, mockReactionData };
        }
    }

    // EXPORT GLOBAL CHO dashboard.js
    const api = new DashboardAPI();
    window.getDashboardData = function () {
        return api.getDashboardData();
    };
    window.generateMockData = function (days) {
        return api.generateMockData(days);
    };
    window.dashboardAPI = api;
})();