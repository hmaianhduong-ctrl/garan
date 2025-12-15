export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import { sendDiscordNotification } from '@/lib/discord'; // <--- IMPORT

// 1. GET: Lấy chi tiết bài viết
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idString } = await params;
        const id = parseInt(idString);
        if (isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

        try { await prisma.view.create({ data: { postId: id } }); } catch (e) {}

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true } },
                tags: { select: { name: true } },
                _count: { select: { comments: true, views: true } }
            }
        });

        if (!post) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

        return NextResponse.json({
            id: post.id,
            title: post.title,
            slug: post.slug,
            description: post.description,
            content: post.content,
            thumbnail: post.thumbnail,
            status: post.status,
            publishedAt: post.publishedAt,
            authorName: post.author?.name || "Admin",
            views: post._count.views,
            commentsCount: post._count.comments,
            tags: post.tags.map(t => t.name)
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Lỗi Server: " + error.message }, { status: 500 });
    }
}

// 2. HÀM UPDATE CHUNG
async function updateHandler(request: Request, params: Promise<{ id: string }>) {
    try {
        const { id: idString } = await params;
        const id = parseInt(idString);
        if (isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

        const body = await request.json();

        // --- Fix lỗi Content ---
        if (body.content && typeof body.content !== 'string') {
            body.content = JSON.stringify(body.content);
        }

        const oldPost = await prisma.post.findUnique({ where: { id } });
        if (!oldPost) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });

        // Xử lý Slug & Date
        let finalSlug = oldPost.slug;
        if (body.slug && body.slug !== oldPost.slug) {
            finalSlug = generateSlug(body.slug);
            const exist = await prisma.post.findUnique({ where: { slug: finalSlug } });
            if (exist && exist.id !== id) finalSlug = `${finalSlug}-${Date.now()}`;
        }

        let publishedAtValue = undefined;
        if (body.publishedAt === null) publishedAtValue = null;
        else if (body.publishedAt) publishedAtValue = new Date(body.publishedAt);

        // Update DB
        const updatedPost = await prisma.post.update({
            where: { id },
            data: {
                title: body.title,
                slug: finalSlug,
                content: body.content,
                thumbnail: body.thumbnail,
                status: body.status,
                description: body.description,
                publishedAt: publishedAtValue,
                tags: Array.isArray(body.tags) ? {
                    set: [],
                    connectOrCreate: body.tags.map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag, slug: generateSlug(tag) }
                    }))
                } : undefined
            },
            include: {
                author: { select: { name: true } },
                tags: { select: { name: true } },
                _count: { select: { comments: true, views: true } }
            }
        });

        // --- GỌI HÀM DISCORD TỪ LIB ---
        // Chỉ gửi khi bài cũ CHƯA publish, mà bài mới LÀ publish
        if (oldPost.status !== 'PUBLISHED' && updatedPost.status === 'PUBLISHED') {
            const postDataForDiscord = {
                title: updatedPost.title,
                description: updatedPost.description,
                slug: updatedPost.slug,
                authorName: updatedPost.author?.name || "Admin",
                thumbnail: updatedPost.thumbnail,
                tags: updatedPost.tags.map(t => t.name).join(", ")
            };
            sendDiscordNotification(postDataForDiscord).catch(console.error);
        }

        return NextResponse.json({
            ...updatedPost,
            authorName: updatedPost.author?.name || "Admin",
            views: updatedPost._count.views,
            commentsCount: updatedPost._count.comments,
            tags: updatedPost.tags.map(t => t.name)
        });

    } catch (error: any) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: "Lỗi Server: " + error.message }, { status: 500 });
    }
}

// Export Method
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return updateHandler(req, params);
}
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return updateHandler(req, params);
}

// 3. DELETE
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idString } = await params;
        const id = parseInt(idString);
        await prisma.post.delete({ where: { id } });
        return NextResponse.json({ message: "Đã xóa" });
    } catch (error) {
        return NextResponse.json({ error: "Lỗi xóa" }, { status: 500 });
    }
}