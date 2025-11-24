import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { generateSlug, validatePostData } from '@/lib/utils'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const errorMsg = validatePostData(body);
    if (errorMsg) {
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    let finalSlug = body.slug ? generateSlug(body.slug) : generateSlug(body.title);

    // Kiểm tra trùng slug
    const existingPost = await prisma.post.findUnique({
      where: { slug: finalSlug }
    });

    if (existingPost) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const newPost = await prisma.post.create({
      data: {
        title: body.title,
        slug: finalSlug,
        content: body.content,
        thumbnail: body.thumbnail || null,
        status: body.status || 'DRAFT',
        description: body.description || "",
        
        // ⚠️ QUAN TRỌNG: Gán bài viết cho User ID = 1
        author: {
           connect: { id: 1 } 
        }
      }
    });

    // Trả về bài viết ĐÃ LƯU
    return NextResponse.json({ 
      message: "Tạo bài viết thành công!", 
      data: newPost 
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Lỗi tạo bài:", error);
    return NextResponse.json({ error: "Lỗi Server (Khả năng do chưa có User ID=1)" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: true }
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}