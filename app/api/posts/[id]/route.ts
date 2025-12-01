import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDiscordNotification } from '@/lib/discord';
import { generateSlug } from '@/lib/utils';

// -------------------------------------------------------------
// 1. GET: Lấy chi tiết bài viết
// -------------------------------------------------------------
export async function GET(
  request: Request,
  // 👇 QUAN TRỌNG: Khai báo params là Promise
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 👇 QUAN TRỌNG: Phải await params trước khi lấy ID
    const resolvedParams = await params; 
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

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

// -------------------------------------------------------------
// 2. PUT: Cập nhật bài viết (Kèm Discord)
// -------------------------------------------------------------
export async function PUT(
  request: Request,
  // 👇 QUAN TRỌNG: Khai báo params là Promise
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 👇 QUAN TRỌNG: Phải await params trước khi lấy ID
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

    const body = await request.json();
    
    // Tìm bài cũ
    const oldPost = await prisma.post.findUnique({ where: { id }, include: { author: true } });
    if (!oldPost) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });

    // Update DB
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: body.title || oldPost.title,
        slug: (body.title && body.title !== oldPost.title) ? generateSlug(body.title) : oldPost.slug,
        content: body.content || oldPost.content,
        thumbnail: body.thumbnail || oldPost.thumbnail,
        description: body.description || oldPost.description,
        status: body.status || oldPost.status,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : oldPost.publishedAt,
      },
    });

    // Gửi Discord
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
    console.error("Lỗi Update:", error);
    return NextResponse.json({ error: "Lỗi Server Update" }, { status: 500 });
  }
}

// -------------------------------------------------------------
// 3. DELETE: Xóa bài viết
// -------------------------------------------------------------
export async function DELETE(
  request: Request,
  // 👇 QUAN TRỌNG: Khai báo params là Promise
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 👇 QUAN TRỌNG: Phải await params trước
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: "Xóa thành công" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server Delete" }, { status: 500 });
  }
}