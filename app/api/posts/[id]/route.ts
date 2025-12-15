import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDiscordNotification } from '@/lib/discord';
import { generateSlug } from '@/lib/utils';

// 1. GET: Lấy chi tiết bài viết (Theo ID)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Chuẩn Next.js 15
) {
  try {
    const { id: idStr } = await params; // Phải await params trước
    const id = parseInt(idStr);

    if (isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!post) return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server Get", details: String(error) }, { status: 500 });
  }
}

// 2. PUT: Cập nhật bài viết (Kèm Logic gửi Discord)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Chuẩn Next.js 15
) {
  try {
    const { id: idStr } = await params; // Phải await params trước
    const id = parseInt(idStr);

    if (isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    
    const body = await request.json();

    // Kiểm tra bài viết cũ
    const oldPost = await prisma.post.findUnique({ where: { id }, include: { author: true } });
    if (!oldPost) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });

    // Cập nhật Database
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: body.title || oldPost.title,
        // Tự động cập nhật slug nếu tiêu đề thay đổi
        slug: (body.title && body.title !== oldPost.title) ? generateSlug(body.title) : oldPost.slug,
        content: body.content || oldPost.content,
        thumbnail: body.thumbnail || oldPost.thumbnail,
        description: body.description || oldPost.description,
        status: body.status || oldPost.status,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : oldPost.publishedAt,
      },
    });

    // 🔔 GỬI DISCORD (Chỉ gửi khi chuyển trạng thái sang PUBLISHED)
    if (body.status === 'PUBLISHED' && oldPost.status !== 'PUBLISHED') {
      await sendDiscordNotification({
        title: updatedPost.title,
        description: updatedPost.description || "Bài viết mới vừa lên sóng!",
        slug: updatedPost.slug,
        authorName: oldPost.author?.name || "Admin"
      });
    }

    return NextResponse.json({ message: "Cập nhật thành công!", data: updatedPost });

  } catch (error) {
    console.error("❌ Lỗi Update:", error);
    return NextResponse.json({ error: "Lỗi Server Update", details: String(error) }, { status: 500 });
  }
}

// 3. DELETE: Xóa bài viết
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Chuẩn Next.js 15
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    if (isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

    // Kiểm tra tồn tại
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Không tìm thấy bài để xóa" }, { status: 404 });

    // Xóa
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: "Đã xóa bài viết thành công" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi không thể xóa bài viết" }, { status: 500 });
  }
}