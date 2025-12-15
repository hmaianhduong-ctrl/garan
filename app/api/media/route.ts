// app/api/media/route.ts (GET)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API Lấy danh sách ảnh hiển thị ra Gallery
export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}