// dashboard.js

// Dữ liệu MOCK ban đầu (chỉ dùng khi chưa có gì trong localStorage)
const initialMockRecentPosts = [
    { id: 1, title: "Hỏi U50 'chất' cùng...", views: 112, publishedDate: '2025-12-02' },
    { id: 2, title: "Hành trình học hỏi và...", views: 224, publishedDate: '2025-11-27' },
    { id: 3, title: "3 loại salad 'cuốn miệng'", views: 11, publishedDate: '2025-11-15' },
    { id: 4, title: "Voucher hot hit của th...", views: 145, publishedDate: '2025-11-01' },
    { id: 5, title: "Công thức gà rán chuẩn vị", views: 50, publishedDate: '2025-10-20' },
];

const initialMockStats = {
    totalPosts: 10,
    totalViews: 3171,
    totalComments: 56,
    totalReactions: 1240,
};

/**
 * Hàm Lấy dữ liệu từ LocalStorage (API Mock)
 * Ưu tiên lấy từ localStorage. Nếu chưa có, sử dụng initial mock và lưu vào localStorage.
 */
function getDashboardData() {
    let posts = initialMockRecentPosts;
    let stats = initialMockStats;
    
    // Lấy Posts
    const storedPosts = localStorage.getItem('mockRecentPosts');
    if (storedPosts) {
        try {
            posts = JSON.parse(storedPosts);
        } catch(e) {
            console.error("Lỗi parse mockRecentPosts:", e);
        }
    } else {
        // Lần đầu chạy, lưu dữ liệu mock vào localStorage
        localStorage.setItem('mockRecentPosts', JSON.stringify(initialMockRecentPosts));
    }

    // Lấy Stats
    const storedStats = localStorage.getItem('mockStats');
    if (storedStats) {
        try {
            stats = JSON.parse(storedStats);
        } catch(e) {
            console.error("Lỗi parse mockStats:", e);
        }
    } else {
         localStorage.setItem('mockStats', JSON.stringify(initialMockStats));
    }

    return { posts, stats };
}


// Cập nhật số liệu thống kê
function updateStats(stats) {
    document.getElementById('total-posts').innerText = stats.totalPosts.toLocaleString();
    document.getElementById('total-views').innerText = stats.totalViews.toLocaleString();
    document.getElementById('total-comments').innerText = stats.totalComments.toLocaleString();
    document.getElementById('total-reactions').innerText = stats.totalReactions.toLocaleString();
}

/**
 * Hàm render danh sách Recent Posts
 * BƯỚC QUAN TRỌNG: Sắp xếp theo ngày xuất bản và chỉ lấy 4 bài đầu tiên.
 */
function renderRecentPosts(posts) {
    const listElement = document.getElementById('recent-posts-list');
    if (!listElement) return;

    // 1. Sắp xếp: Mới nhất lên đầu (publishedDate giảm dần)
    const sortedPosts = posts.sort((a, b) => {
        return new Date(b.publishedDate) - new Date(a.publishedDate);
    });

    // 2. Giới hạn: Chỉ lấy 4 bài đầu tiên (theo yêu cầu)
    const top4Posts = sortedPosts.slice(0, 4);

    // 3. Render HTML
    listElement.innerHTML = top4Posts.map(post => {
        const formattedDate = new Date(post.publishedDate).toLocaleDateString('vi-VN');

        return `
            <li class="flex items-center justify-between py-2 border-b border-gray-300/50">
                <div class="flex items-center">
                    <div class="h-10 w-10 bg-primary/20 rounded-full object-cover mr-3 flex items-center justify-center text-primary text-sm font-bold opacity-60">
                        P${post.id}
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900 line-clamp-1">${post.title}</p>
                        <p class="text-xs text-gray-600">${formattedDate}</p>
                    </div>
                </div>
                <span class="text-sm text-gray-700">${post.views.toLocaleString()}</span>
            </li>
        `;
    }).join('');
    
    // Gỡ bỏ border cuối cùng
    const lastLi = listElement.lastElementChild;
    if (lastLi) {
        lastLi.classList.remove('border-b', 'border-gray-300/50');
    }
}

// Hàm tạo dữ liệu Mock 30 ngày cho Chart.js 
function generateMockData(days) {
    const data = [];
    let date = new Date();
    date.setDate(date.getDate() - days + 1); 

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(date);
        const dateString = currentDate.toISOString().split('T')[0];
        
        const views = Math.floor(Math.random() * 2000) + 500;
        const likes = Math.floor(views * (Math.random() * 0.1 + 0.1));

        data.push({
            date: dateString,
            views: views,
            likes: likes
        });
        date.setDate(date.getDate() + 1);
    }
    return data;
}

// Hàm khởi tạo biểu đồ
function initializeChart() {
    const mockData = generateMockData(30);
    const labels = mockData.map(d => new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
    const viewsData = mockData.map(d => d.views);
    const likesData = mockData.map(d => d.likes);

    const allData = [...viewsData, ...likesData];
    const maxVal = Math.max(...allData);
    
    const initialStep = maxVal / 5;
    const yStep = Math.ceil(initialStep / 100) * 100;
    const suggestedMax = Math.ceil(maxVal / yStep) * yStep;

    const data = {
        labels: labels,
        datasets: [{
            label: 'Views',
            data: viewsData,
            fill: true,
            borderColor: '#BA3801',
            backgroundColor: 'rgba(186, 56, 1, 0.1)',
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 3,
            pointBackgroundColor: '#BA3801',
        },
        {
            label: 'Likes',
            data: likesData,
            fill: false,
            borderColor: '#FFEDA8',
            borderDash: [5, 5], 
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#FFEDA8',
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeInOutQuad'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax > 0 ? suggestedMax + yStep : 1000, 
                    ticks: {
                        stepSize: yStep,
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        drawBorder: false,
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7, 
                    },
                    grid: {
                        display: false 
                    }
                }
            },
            plugins: {
                legend: {
                    display: false 
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        title: function(context) {
                            return new Date(mockData[context[0].dataIndex].date).toDateString();
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (context.parsed.y !== null) {
                                label = `${label}: ${context.parsed.y.toLocaleString()} ${context.dataset.label}`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    };

    const chartCtx = document.getElementById('viewsChart');
    if (chartCtx) {
        new Chart(chartCtx, config);
    }
}

// Hàm xử lý xuất dữ liệu khi bấm nút Export
function handleExport() {
    const dateInput = document.getElementById('export-date');
    const selectedDate = dateInput.value;
    
    if (!selectedDate) {
        alert("Vui lòng chọn ngày để xuất dữ liệu!");
        return;
    }

    const dateParts = selectedDate.split('-');
    const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    const mockViewData = [
        { time: '08:00', count: 50 },
        { time: '12:00', count: 120 },
        { time: '18:00', count: 200 },
    ];
    console.log(`Xuất CSV View cho ngày ${selectedDate}:`, mockViewData);
    
    const mockReactionData = [
        { time: '09:00', type: 'Like', count: 15 },
        { time: '14:00', type: 'Love', count: 30 },
    ];
    console.log(`Xuất CSV Reaction cho ngày ${selectedDate}:`, mockReactionData);

    alert(`Đã mô phỏng Export View & Reaction cho ngày ${displayDate}.\nKiểm tra console để xem dữ liệu.`);
}

// === LOGIC XỬ LÝ HEADER VÀ AVATAR DROP DOWN (CHỨC NĂNG LOG OUT) ===
function initializeHeaderInteractions() {
    const avatar = document.getElementById('user-avatar');
    const dropdown = document.getElementById('logout-dropdown');
    const header = document.getElementById('header');

    // 1. Xử lý khi click vào Avatar
    if (avatar && dropdown) {
        avatar.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // 2. Xử lý khi click ra ngoài Dropdown
        document.addEventListener('click', (event) => {
            if (dropdown.classList.contains('show') && !avatar.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // 3. Xử lý scroll header (để đổi màu)
    if (header) {
         window.addEventListener('scroll', function() {
             if (window.scrollY > 50) {
                 header.classList.add('scrolled');
             } else {
                 header.classList.remove('scrolled');
             }
         });
    }
}


// Chờ DOM load xong để khởi tạo và gắn sự kiện
document.addEventListener('DOMContentLoaded', () => {
    // Lấy dữ liệu mới nhất (từ localStorage)
    const { posts, stats } = getDashboardData();
    
    updateStats(stats);
    renderRecentPosts(posts); // Gọi hàm render với dữ liệu đã lấy
    initializeChart();
    initializeHeaderInteractions(); // Khởi tạo logic Dropdown/Logout

    const exportButton = document.getElementById('export-button');
    if (exportButton) {
        exportButton.addEventListener('click', handleExport);
    }
});