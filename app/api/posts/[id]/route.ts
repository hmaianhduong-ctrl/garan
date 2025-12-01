import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDiscordNotification } from '@/lib/discord'; // Import Discord
import { generateSlug } from '@/lib/utils';

// 1. GET: Lấy chi tiết bài viết (Để hiển thị lên form sửa)
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
    if (!post) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

// 2. PUT: Cập nhật bài viết (KẾT NỐI DB + DISCORD)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // A. Tìm bài cũ trong Database
    const oldPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!oldPost) return NextResponse.json({ error: "404 Not Found" }, { status: 404 });

    // B. Xử lý Slug (Nếu đổi tiêu đề thì đổi slug)
    let finalSlug = oldPost.slug;
    if (body.title && body.title !== oldPost.title) {
        finalSlug = generateSlug(body.title);
    }

    // C. CẬP NHẬT DATABASE (Prisma)
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: body.title || oldPost.title,
        slug: finalSlug,
        content: body.content || oldPost.content,
        description: body.description || oldPost.description,
        thumbnail: body.thumbnail || oldPost.thumbnail, // Lưu link ảnh từ Upload API vào đây
        status: body.status || oldPost.status,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : oldPost.publishedAt,
      },
    });

    // D. GỬI DISCORD (Integration)
    // Chỉ gửi khi bài viết vừa chuyển sang PUBLISHED
    if (body.status === 'PUBLISHED' && oldPost.status !== 'PUBLISHED') {
      console.log("🚀 Kích hoạt Discord Notification...");
      await sendDiscordNotification({
        title: updatedPost.title,
        description: updatedPost.description || "Bài viết mới!",
        slug: updatedPost.slug,
        authorName: oldPost.author?.name || "Admin"
      });
    }

    return NextResponse.json({ message: "Update thành công!", data: updatedPost });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Lỗi Update" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

    // Kiểm tra xem bài viết có tồn tại không trước khi xóa
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Không tìm thấy bài viết để xóa" }, { status: 404 });

    // Xóa bài viết
    await prisma.post.delete({ where: { id } });
    
    return NextResponse.json({ message: "Đã xóa bài viết thành công" });
  } catch (error) {
    console.error("Lỗi xóa bài:", error);
    return NextResponse.json({ error: "Lỗi Server Delete" }, { status: 500 });
  }
}