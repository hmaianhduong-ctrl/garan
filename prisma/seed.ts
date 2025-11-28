import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Tạo Admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "ADMIN",
    },
  });

  // Tạo 5 bài viết mẫu
  const posts = [];
  for (let i = 1; i <= 5; i++) {
    const post = await prisma.post.create({
      data: {
        title: `Bài viết mẫu ${i}`,
        slug: `bai-viet-mau-${i}`,
        description: `Mô tả ngắn bài viết ${i}`,
        content: `<p>Nội dung bài viết mẫu ${i}</p>`,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: admin.id,
      },
    });
    posts.push(post);
  }

  // Tạo 2 comment cho mỗi post
  for (const post of posts) {
    for (let j = 1; j <= 2; j++) {
      await prisma.comment.create({
        data: {
          content: `Comment ${j} cho "${post.title}"`,
          postId: post.id,
          userId: admin.id,
        },
      });
    }
  }

  console.log("✅ Seed database completed!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
