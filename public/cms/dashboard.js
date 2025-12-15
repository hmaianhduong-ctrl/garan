// FILE: cms/dashboard.js

/**
 * ******************************************************
 * DASHBOARD API (GỘP REAL API VÀ MOCK CHART)
 * ******************************************************
 */

const API_URL = '/api/dashboard';

// Dữ liệu MOCK ban đầu (Chỉ dùng làm fallback nếu API lỗi)
const initialMockStats = {
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0,
    totalReactions: 0,
};

/**
 * [REAL API] Hàm Lấy dữ liệu Tổng quan & Top Posts từ Next.js API
 */
async function getDashboardDataReal() {
    try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        
        const data = await res.json();
        
        // Trả về cấu trúc phù hợp với Frontend
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
        console.error("[DASHBOARD API ERROR] Sử dụng Mock Data:", error);
        // Trả về số 0 nếu lỗi (dữ liệu ban đầu)
        return {
            posts: [],
            stats: initialMockStats
        };
    }
}


/**
 * [MOCK DATA] Hàm tạo dữ liệu Mock 30 ngày cho Chart.js (Giữ nguyên tĩnh)
 */
function generateMockData(days) {
    const data = [];
    let date = new Date();
    date.setDate(date.getDate() - days + 1); 

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(date);
        const dateString = currentDate.toISOString().split('T')[0];
        
        const views = Math.floor(Math.random() * 2000) + 500;
        const likes = Math.floor(views * (Math.random() * 0.1 + 0.1));

        data.push({ date: dateString, views: views, likes: likes });
        date.setDate(date.getDate() + 1);
    }
    return data;
}

// === LOGIC RENDER ===

// Cập nhật số liệu thống kê
function updateStats(stats) {
    const formatter = new Intl.NumberFormat('en-US');
    document.getElementById('total-posts').innerText = formatter.format(stats.totalPosts);
    document.getElementById('total-views').innerText = formatter.format(stats.totalViews);
    document.getElementById('total-comments').innerText = formatter.format(stats.totalComments);
    document.getElementById('total-reactions').innerText = formatter.format(stats.totalReactions);
}

/**
 * Hàm render danh sách Recent Posts (Sử dụng dữ liệu thật từ API)
 */
function renderRecentPosts(posts) {
    const listElement = document.getElementById('recent-posts-list');
    if (!listElement) return;

    // Sắp xếp theo Views (sử dụng dữ liệu TopPosts đã sắp xếp từ Server)
    const top4Posts = posts.slice(0, 4);

    if (top4Posts.length === 0) {
        listElement.innerHTML = '<li class="text-gray-500 text-center py-4">Chưa có bài viết nào được thống kê.</li>';
        return;
    }

    // 3. Render HTML
    listElement.innerHTML = top4Posts.map(post => {
        // Post object từ API: { id, title, views, commentsCount }
        const views = post.views || 0;
        const formattedDate = new Date().toLocaleDateString('vi-VN'); // Ngày hiện tại vì API không trả về publishedDate
        const comments = post.commentsCount || 0;

        return `
            <li class="flex items-center justify-between py-2 border-b border-gray-300/50">
                <a href="posts.html?edit=${post.id}" class="flex items-center w-full">
                    <div class="h-10 w-10 bg-primary/20 rounded-full object-cover mr-3 flex items-center justify-center text-primary text-sm font-bold opacity-60 flex-shrink-0">
                        P${post.id}
                    </div>
                    <div class="flex-grow min-w-0 pr-4">
                        <p class="text-sm font-medium text-gray-900 line-clamp-1">${post.title}</p>
                        <p class="text-xs text-gray-600">${comments} Comments</p>
                    </div>
                </a>
                <span class="text-sm text-gray-700 whitespace-nowrap">${views.toLocaleString()}</span>
            </li>
        `;
    }).join('');
    
    // Gỡ bỏ border cuối cùng
    const lastLi = listElement.lastElementChild;
    if (lastLi) {
        lastLi.classList.remove('border-b', 'border-gray-300/50');
    }
}

// Hàm khởi tạo biểu đồ (Giữ nguyên logic Chart.js Mock)
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
            animation: { duration: 1500, easing: 'easeInOutQuad' },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax > 0 ? suggestedMax + yStep : 1000, 
                    ticks: {
                        stepSize: yStep,
                        callback: function(value) { return value.toLocaleString(); }
                    },
                    grid: { drawBorder: false, }
                },
                x: {
                    ticks: { autoSkip: true, maxTicksLimit: 7, },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        title: function(context) { return new Date(mockData[context[0].dataIndex].date).toDateString(); },
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

// === LOGIC XỬ LÝ HEADER VÀ AVATAR DROP DOWN ===
function initializeHeaderInteractions() {
    const avatar = document.getElementById('user-avatar');
    const dropdown = document.getElementById('logout-dropdown');
    const header = document.getElementById('header');

    if (avatar && dropdown) {
        avatar.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (dropdown.classList.contains('show') && !avatar.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

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

// Hàm xử lý xuất dữ liệu (Giữ nguyên Mock Data)
function handleExport() {
    const dateInput = document.getElementById('export-date');
    const selectedDate = dateInput.value;
    
    if (!selectedDate) {
        alert("Vui lòng chọn ngày để xuất dữ liệu!");
        return;
    }

    const dateParts = selectedDate.split('-');
    const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    // Mock data export
    const mockViewData = [
        { time: '08:00', count: 50 }, { time: '12:00', count: 120 }, { time: '18:00', count: 200 },
    ];
    const mockReactionData = [
        { time: '09:00', type: 'Like', count: 15 }, { time: '14:00', type: 'Love', count: 30 },
    ];

    console.log(`Xuất CSV View cho ngày ${selectedDate}:`, mockViewData);
    console.log(`Xuất CSV Reaction cho ngày ${selectedDate}:`, mockReactionData);

    alert(`Đã mô phỏng Export View & Reaction cho ngày ${displayDate}.\nKiểm tra console để xem dữ liệu.`);
}


// === KHỞI CHẠY CHÍNH ===
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Lấy dữ liệu thật từ API
    const { posts, stats } = await getDashboardDataReal();
    
    // 2. Render các phần (Stats và Recent Posts dùng dữ liệu thật)
    updateStats(stats);
    renderRecentPosts(posts); 
    
    // 3. Render Chart (dùng Mock Data)
    initializeChart();

    // 4. Khởi tạo sự kiện
    initializeHeaderInteractions();
    const exportButton = document.getElementById('export-button');
    if (exportButton) {
        exportButton.addEventListener('click', handleExport);
    }
});