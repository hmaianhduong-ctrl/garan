// app/api/test-discord/route.ts
import { NextResponse } from 'next/server';
import { sendDiscordNotification } from '@/lib/discord';

export async function POST() {
  // Giả lập dữ liệu một bài viết vừa được Publish
  const mockPost = {
    title: "Khai trương chi nhánh Cầu Giấy - Giảm 50%",
    description: "Nhân dịp khai trương, Gà Rán F&B tặng voucher cho 100 khách đầu tiên.",
    slug: "khai-truong-cau-giay",
    authorName: "Dương Admin"
  };

  // Gọi hàm gửi thông báo
  await sendDiscordNotification(mockPost);

  return NextResponse.json({ message: "Đã kích hoạt gửi Discord, hãy kiểm tra kênh chat!" });
}