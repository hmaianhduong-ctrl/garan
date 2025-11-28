import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDiscordNotification } from '@/lib/discord'; // Import hàm gửi Discord
import { generateSlug } from '@/lib/utils';

// 1. API LẤY CHI TIẾT 1 BÀI (GET BY ID)
// Dùng cho trang chi tiết bài viết sau này
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// 2. API CẬP NHẬT BÀI VIẾT (PUT)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // A. Tìm bài viết cũ xem có tồn tại không
    const oldPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!oldPost) {
      return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    // B. Xử lý Slug (Nếu có sửa tiêu đề/slug thì cập nhật, không thì giữ nguyên)
    let finalSlug = oldPost.slug;
    if (body.slug) finalSlug = generateSlug(body.slug);
    else if (body.title && body.title !== oldPost.title) finalSlug = generateSlug(body.title);

    // C. Cập nhật vào Database
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: body.title || oldPost.title,
        slug: finalSlug,
        content: body.content || oldPost.content,
        thumbnail: body.thumbnail || oldPost.thumbnail,
        description: body.description || oldPost.description,
        status: body.status || oldPost.status,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : oldPost.publishedAt,
      },
    });

    // D. 🔔 LOGIC GỬI DISCORD (QUAN TRỌNG NHẤT)
    // Chỉ gửi khi: Bài cũ KHÔNG PHẢI Published -> Bài mới LÀ Published
    if (body.status === 'PUBLISHED' && oldPost.status !== 'PUBLISHED') {
      console.log("🚀 Kích hoạt thông báo Discord...");
      
      await sendDiscordNotification({
        title: updatedPost.title,
        description: updatedPost.description || "Hãy xem bài viết mới nhất vừa lên sóng!",
        slug: updatedPost.slug,
        authorName: oldPost.author?.name || "Admin"
      });
    }

    return NextResponse.json({ 
      message: "Cập nhật thành công!", 
      data: updatedPost 
    });

  } catch (error) {
    console.error("Lỗi update:", error);
    return NextResponse.json({ error: "Lỗi Server Update" }, { status: 500 });
  }
}