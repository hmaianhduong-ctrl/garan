// api-dashboard.js
/**
 * ******************************************************
 * DASHBOARD API – ADAPTER VERSION (SAFE & COMPATIBLE)
 * ******************************************************
 */

(function () {
    /* =========================
     * MOCK DATA (NGUỒN DUY NHẤT)
     * ========================= */
    const INITIAL_POSTS = [
        { id: 1, title: "Hỏi U50 'chất' cùng...", views: 112, publishedDate: '2025-12-02' },
        { id: 2, title: "Hành trình học hỏi và...", views: 224, publishedDate: '2025-11-27' },
        { id: 3, title: "3 loại salad 'cuốn miệng'", views: 11, publishedDate: '2025-11-15' },
        { id: 4, title: "Voucher hot hit của th...", views: 145, publishedDate: '2025-11-01' },
        { id: 5, title: "Công thức gà rán chuẩn vị", views: 50, publishedDate: '2025-10-20' },
    ];

    const INITIAL_STATS = {
        totalPosts: 10,
        totalViews: 3171,
        totalComments: 56,
        totalReactions: 1240,
    };

    /* =========================
     * CORE API CLASS
     * ========================= */
    class DashboardAPI {
        getDashboardData() {
            let posts = INITIAL_POSTS;
            let stats = INITIAL_STATS;

            const storedPosts = localStorage.getItem('mockRecentPosts');
            if (storedPosts) {
                try {
                    posts = JSON.parse(storedPosts);
                } catch {
                    posts = INITIAL_POSTS;
                }
            } else {
                localStorage.setItem('mockRecentPosts', JSON.stringify(INITIAL_POSTS));
            }

            const storedStats = localStorage.getItem('mockStats');
            if (storedStats) {
                try {
                    stats = JSON.parse(storedStats);
                } catch {
                    stats = INITIAL_STATS;
                }
            } else {
                localStorage.setItem('mockStats', JSON.stringify(INITIAL_STATS));
            }

            return { posts, stats };
        }

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

        getExportMockData(selectedDate) {
            const [y, m, d] = selectedDate.split('-');
            const displayDate = `${d}/${m}/${y}`;

            const mockViewData = [
                { time: '08:00', count: 50 },
                { time: '12:00', count: 120 },
                { time: '18:00', count: 200 },
            ];

            const mockReactionData = [
                { time: '09:00', type: 'Like', count: 15 },
                { time: '14:00', type: 'Love', count: 30 },
            ];

            console.log(`[DASHBOARD API MOCK] Export View (${selectedDate})`, mockViewData);
            console.log(`[DASHBOARD API MOCK] Export Reaction (${selectedDate})`, mockReactionData);

            return { displayDate, mockViewData, mockReactionData };
        }
    }

    /* =========================
     * ADAPTER / BRIDGE LAYER
     * ========================= */

    const api = new DashboardAPI();

    // Giữ nguyên contract cũ cho dashboard.js
    window.getDashboardData = function () {
        return api.getDashboardData();
    };

    window.generateMockData = function (days) {
        return api.generateMockData(days);
    };

    // Chuẩn bị cho tương lai (không dùng hiện tại)
    window.dashboardAPI = api;
})();
