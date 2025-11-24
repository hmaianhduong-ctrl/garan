import { NextResponse } from 'next/server';
import { generateSlug, validatePostData } from '@/lib/utils';
// Dữ liệu giả lập (Sthay bằng prisma.post.findMany)
const MOCK_POSTS = [
  {
    id: 1,
    title: "Khuyến mãi Gà Rán Thứ 4 Vui Vẻ",
    slug: "khuyen-mai-ga-ran-thu-4",
    thumbnail: "https://via.placeholder.com/150",
    status: "PUBLISHED",
    createdAt: "2023-10-20T08:00:00Z"
  },
  {
    id: 2,
    title: "Bài viết nháp chưa đăng",
    slug: "bai-viet-nhap",
    thumbnail: null,
    status: "DRAFT",
    createdAt: "2023-10-21T09:00:00Z"
  }
];

// GET: Trả về danh sách bài viết
export async function GET() {
  // Giả vờ đợi 1 giây cho giống mạng thật (Optional)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return NextResponse.json(MOCK_POSTS);
}


export async function POST(request: Request) {
  try {
    const body = await request.json(); // Lấy dữ liệu Admin gửi lên

    // 1. VALIDATE: Kiểm tra lỗi bằng hàm tiện ích
    // (Logic này chạy ngay lập tức, không cần Database)
    const errorMsg = validatePostData(body);
    if (errorMsg) {
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // 2. FORMAT: Tự động tạo slug chuẩn SEO
    // (Logic này cũng xử lý luôn, không cần Database)
    let finalSlug = body.slug;
    if (!finalSlug) {
      finalSlug = generateSlug(body.title); 
    } else {
      finalSlug = generateSlug(finalSlug);
    }

    // --- ĐẾN ĐÂY LÀ XONG PHẦN LOGIC KHÔNG CẦN DB ---

    // Trả về kết quả để bạn test Postman ngay
    return NextResponse.json({ 
      message: "Check dữ liệu thành công (Logic OK)", 
      data_received: {
          title: body.title,
          original_slug: body.slug,
          generated_slug: finalSlug, // Xem cái này có ra chuẩn không 
          status: body.status || 'DRAFT'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}