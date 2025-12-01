import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDiscordNotification } from '@/lib/discord';

// API này sẽ được gọi tự động (hoặc bấm tay) để quét bài hẹn giờ
export async function GET() {
  try {
    const now = new Date();

    // 1. Tìm các bài đang Lên lịch (SCHEDULED) 
    const duePosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        publishedAt: {
          lte: now // lte = Less Than or Equal (Nhỏ hơn hoặc bằng hiện tại)
        }
      },
      include: { author: true }
    });

    // Nếu không có bài nào cần đăng
    if (duePosts.length === 0) {
      return NextResponse.json({ message: "Không có bài viết nào cần xuất bản." });
    }

    // 2. Duyệt qua từng bài và Publish
    const results = [];
    
    for (const post of duePosts) {
      // Update trạng thái
      await prisma.post.update({
        where: { id: post.id },
        data: { status: 'PUBLISHED' }
      });

      // Bắn Discord
      await sendDiscordNotification({
        title: post.title,
        description: "⏰ Bài viết hẹn giờ đã được tự động xuất bản!",
        slug: post.slug,
        authorName: post.author?.name || "Hệ thống Auto"
      });

      results.push(`Đã đăng: ${post.title}`);
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      details: results 
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống Cron" }, { status: 500 });
  }
}