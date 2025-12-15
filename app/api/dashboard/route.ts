// FILE: app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. TÍNH TỔNG SỐ LƯỢNG (COUNTS)
    const [
      totalUsers,
      totalPosts,
      totalComments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
    ]);

    // 2. TÍNH TỔNG LƯỢT XEM VÀ LƯỢT THÍCH (AGGREGATE)
    const [
      totalViewsResult,
      totalReactionsResult
    ] = await Promise.all([
      prisma.view.aggregate({
        _count: true,
      }),
      prisma.reaction.aggregate({
        _count: true,
      }),
    ]);
    
    // 3. LẤY BÀI VIẾT XEM NHIỀU NHẤT (Top 5)
    // Cần join/group by post id trong Prisma. Thay vì dùng query phức tạp, ta lấy 5 bài có Views nhiều nhất
    const topPosts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        views: {
          select: { id: true }
        },
        _count: {
            select: { comments: true }
        }
      },
      orderBy: {
        views: {
            _count: 'desc' // Sắp xếp theo số lượng views
        }
      },
      take: 5,
    });
    
    // Format lại topPosts cho dễ dùng (thêm tổng views)
    const topPostsFormatted = topPosts.map(p => ({
        id: p.id,
        title: p.title,
        views: p.views.length,
        commentsCount: p._count.comments
    }));


    // 4. TRẢ VỀ TẤT CẢ DỮ LIỆU
    return NextResponse.json({
      summary: {
        users: totalUsers,
        posts: totalPosts,
        comments: totalComments,
        views: totalViewsResult._count,
        reactions: totalReactionsResult._count,
      },
      topPosts: topPostsFormatted,
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: 'Lỗi tải dữ liệu Dashboard' }, { status: 500 });
  }
}