    import { NextResponse } from 'next/server';
    import { prisma } from '@/lib/prisma';
    import { generateSlug, validatePostData } from '@/lib/utils';

    // 1. GET: Lấy danh sách bài viết
    export async function GET() {
    try {
        const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: true }
        });
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: "Lỗi lấy danh sách" }, { status: 500 });
    }
    }

    // 2. POST: Tạo bài viết mới
    export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Validate
        const errorMsg = validatePostData(body);
        if (errorMsg) return NextResponse.json({ error: errorMsg }, { status: 400 });

        // Slug
        let finalSlug = body.slug ? generateSlug(body.slug) : generateSlug(body.title);
        const existingPost = await prisma.post.findUnique({ where: { slug: finalSlug } });
        if (existingPost) finalSlug = `${finalSlug}-${Date.now()}`;

        // Create
        const newPost = await prisma.post.create({
        data: {
            title: body.title,
            slug: finalSlug,
            content: body.content,
            thumbnail: body.thumbnail || null,
            status: body.status || 'DRAFT',
            description: body.description || "",
            publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
            author: { connect: { id: 1 } } // Admin ID=1
        }
        });

        return NextResponse.json({ message: "Tạo bài viết thành công!", data: newPost }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Lỗi Server Create" }, { status: 500 });
    }
    }