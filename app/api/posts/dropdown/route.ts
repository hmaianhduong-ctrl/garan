// FILE: app/api/posts/dropdown/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: 'desc', // Sắp xếp bài mới nhất lên đầu theo yêu cầu của bạn
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}