// File: cron-worker.ts
// Run: npx tsx cron-worker.ts

async function runCron() {
  console.log(`[${new Date().toLocaleTimeString()}] 🤖 Robot đang kiểm tra bài hẹn giờ...`);
  
  try {
    // Gọi vào API Cron của chính mình
    const res = await fetch('http://localhost:3000/api/cron', { 
        method: 'GET',
        cache: 'no-store' 
    });
    
    if (res.ok) {
        const data = await res.json();
        if (data.processed > 0) {
            console.log(`✅ ĐÃ ĐĂNG BÀI:`, data.details);
        }
    } else {
        console.error("❌ Lỗi gọi API:", res.status);
    }
  } catch (error) {
    console.error("❌ Server chưa bật hoặc lỗi mạng.");
  }
}

// Cấu hình: Chạy mỗi 60 giây (60000 ms)
console.log("🚀 Cron Worker đã khởi động! (Check mỗi 1 phút)");
setInterval(runCron, 60000); 

// Chạy ngay lần đầu luôn cho nóng
runCron();