import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Đảm bảo đường dẫn đúng tới file prisma instance

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const postId = searchParams.get('postId');

    // Xây dựng bộ lọc
    let where: any = {};

    // Lọc theo Post ID (Schema: postId Int)
    if (postId && postId !== 'all') {
      where.postId = parseInt(postId);
    }

    // Lọc theo trạng thái ẩn/hiện (Schema: isHidden Boolean)
    if (status && status !== 'all') {
      where.isHidden = (status === 'HIDDEN'); // Nếu chọn HIDDEN thì true, ngược lại false
    }

    // Tìm kiếm (Tìm trong content hoặc tên người dùng)
    if (search) {
      where.OR = [
        { content: { contains: search } },
        { user: { name: { contains: search } } } // Join sang bảng User để tìm tên
      ];
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        // Schema: user User @relation(...) -> Lấy tên user
        user: { 
          select: { id: true, name: true, email: true } 
        },
        // Schema: post Post @relation(...) -> Lấy tiêu đề post
        post: { 
          select: { title: true } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format dữ liệu trả về cho Frontend dễ hiển thị
    const formattedData = comments.map(item => ({
      id: item.id,
      content: item.content,
      isHidden: item.isHidden,
      createdAt: item.createdAt,
      // Map quan hệ User -> author
      author: item.user ? item.user.name : 'Người dùng đã xóa',
      // Map quan hệ Post -> postTitle
      postTitle: item.post ? item.post.title : 'Bài viết đã xóa',
      postId: item.postId
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: 'Lỗi server khi tải comments' }, { status: 500 });
  }
}