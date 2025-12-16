import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug, validatePostData } from '@/lib/utils';
import { sendDiscordNotification } from '@/lib/discord';

// 1. GET: Lấy danh sách bài viết
export async function GET(request: Request) {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' }, 
      include: {
        author: { select: { id: true, name: true } },
        tags: true, // Lấy toàn bộ object Tag
        _count: { select: { comments: true, views: true } }
      }
    });

    const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        description: post.description,
        content: post.content, 
        thumbnail: post.thumbnail,
        status: post.status,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        authorName: post.author?.name || "Admin",
        views: post._count.views, 
        commentsCount: post._count.comments,
        // Map tags lấy name
        tags: post.tags.map(t => t.name)
    }));

    return NextResponse.json(formattedPosts);

  } catch (error: any) {
    console.error("❌ Lỗi GET Posts:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

// 2. POST: Tạo bài viết mới
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- Fix lỗi Content: Chuyển Object thành String ---
    if (body.content && typeof body.content !== 'string') {
        body.content = JSON.stringify(body.content);
    }

    // Validate dữ liệu
    const errorMsg = validatePostData(body);
    if (errorMsg) return NextResponse.json({ error: errorMsg }, { status: 400 });

    // Tự động tìm User (Logic của bạn)
    let author = await prisma.user.findFirst();
    if (!author) {
        author = await prisma.user.create({
            data: { email: "admin_auto@system.com", name: "System Admin", role: "ADMIN", password: "hashed_password_here" }
        });
    }

    // Xử lý Slug & Date
    let finalSlug = body.slug ? generateSlug(body.slug) : generateSlug(body.title);
    const existingPost = await prisma.post.findUnique({ where: { slug: finalSlug } });
    if (existingPost) finalSlug = `${finalSlug}-${Date.now()}`;

    let publishedAtValue = body.publishedAt ? new Date(body.publishedAt) : null;
    if (body.status === 'PUBLISHED' && !publishedAtValue) {
        publishedAtValue = new Date();
    }

    // Tạo bài viết vào DB
    const newPost = await prisma.post.create({
      data: {
        title: body.title,
        slug: finalSlug,
        content: body.content,
        thumbnail: body.thumbnail || null,
        status: body.status || 'DRAFT',
        description: body.description || "",
        publishedAt: publishedAtValue,
        author: { connect: { id: author.id } },
        
        // --- SỬA LOGIC TAGS (QUAN TRỌNG) ---
        tags: {
            connectOrCreate: (body.tags || []).map((tag: string) => ({
                where: { name: tag },
                create: { name: tag } // <--- BỎ SLUG Ở ĐÂY VÌ MODEL TAG KHÔNG CÒN SLUG
            })),
        },
      },
      include: {
        author: { select: { name: true } },
        tags: { select: { name: true } }
      }
    });

    // --- GỌI HÀM DISCORD ---
    if (newPost.status === 'PUBLISHED') {
        const postDataForDiscord = {
            title: newPost.title,
            description: newPost.description,
            slug: newPost.slug,
            authorName: newPost.author?.name || "Admin",
            thumbnail: newPost.thumbnail, 
            tags: newPost.tags.map(t => t.name).join(", ")
        };
        sendDiscordNotification(postDataForDiscord).catch(console.error);
    }
        
    // Format kết quả trả về
    const responseData = {
        ...newPost,
        authorName: newPost.author?.name,
        views: 0, 
        commentsCount: 0,
        tags: newPost.tags.map(t => t.name)
    };
    // @ts-ignore
    delete responseData.author;

    return NextResponse.json(responseData, { status: 201 });

  } catch (error: any) {
    console.error("❌ Lỗi POST:", error);
    return NextResponse.json({ error: "Lỗi Server: " + error.message }, { status: 500 });
  }
}