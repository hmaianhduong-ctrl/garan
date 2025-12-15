// FILE: app/api/comments/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Định nghĩa kiểu cho params (Next.js 15: params là Promise)
type Props = {
  params: Promise<{ id: string }>
}

// 1. PATCH: Ẩn/Hiện comment
export async function PATCH(request: Request, props: Props) {
  try {
    // QUAN TRỌNG: Phải await params trước khi lấy id
    const params = await props.params; 
    const id = parseInt(params.id);

    // Kiểm tra xem ID có hợp lệ không
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const body = await request.json(); // Nhận { isHidden: true/false }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { isHidden: body.isHidden },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Lỗi PATCH:", error);
    return NextResponse.json({ error: 'Lỗi cập nhật server' }, { status: 500 });
  }
}

// 2. DELETE: Xóa comment
export async function DELETE(request: Request, props: Props) {
  try {
    // QUAN TRỌNG: Phải await params trước khi lấy id
    const params = await props.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Đã xóa thành công' });
  } catch (error) {
    console.error("Lỗi DELETE:", error);
    return NextResponse.json({ error: 'Lỗi xóa comment' }, { status: 500 });
  }
}