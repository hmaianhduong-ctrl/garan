// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Đang gieo dữ liệu từ Mockup vào Database...')

  // ==========================================
  // 1. TẠO USER (Đã sửa lỗi Enum)
  // ==========================================
  
  // Tạo Admin (Boss Admin)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Boss Admin',
      password: '123456', 
      role: UserRole.OWNER, // Đã sửa: Dùng UserRole.OWNER thay vì "owner"
    },
  })

  // Tạo Editor (Eli Reviewer)
  const editor = await prisma.user.upsert({
    where: { email: 'editor@gmail.com' },
    update: {},
    create: {
      email: 'editor@gmail.com',
      name: 'Eli Reviewer',
      password: '123456',
      role: UserRole.EDITOR, // Đã sửa
    },
  })

  // Tạo Guest Users (Người xem comment dạo)
  const guestA = await prisma.user.upsert({
    where: { email: 'guestA@gmail.com' },
    update: {},
    create: { email: 'guestA@gmail.com', name: 'Nguyễn Văn A', password: '123', role: UserRole.VIEWER },
  })
  
  const guestB = await prisma.user.upsert({
    where: { email: 'guestB@gmail.com' },
    update: {},
    create: { email: 'guestB@gmail.com', name: 'Hoàng Thị B', password: '123', role: UserRole.VIEWER },
  })

  const guestC = await prisma.user.upsert({
    where: { email: 'guestC@gmail.com' },
    update: {},
    create: { email: 'guestC@gmail.com', name: 'Lê C', password: '123', role: UserRole.VIEWER },
  })

  console.log('✅ Đã tạo xong Users')

  // ==========================================
  // 2. TẠO MEDIA (Lấy từ api-media.js)
  // ==========================================
  const mediaData = [
    { url: 'https://i.postimg.cc/L8gYp4t2/media-1.jpg', name: 'hamburger-cheese.jpg' },
    { url: 'https://i.postimg.cc/Gpd2Nf0C/media-2.jpg', name: 'salad-fresh.jpg' },
    { url: 'https://i.postimg.cc/1X9S34QZ/media-3.jpg', name: 'steak-plate.jpg' },
    { url: 'https://i.postimg.cc/k47g213n/phovn.jpg', name: 'pho-vietnam.jpg' },
    { url: 'https://i.postimg.cc/W3sL831w/media-5.jpg', name: 'coffee-cup.jpg' },
    { url: 'https://i.postimg.cc/W12p6B33/media-6.jpg', name: 'pasta-dish.jpg' },
  ]

  for (const m of mediaData) {
    // Lưu ý: Nếu Database của bạn không có cột 'name' trong bảng Media thì xóa dòng 'name: m.name' đi
    await prisma.media.create({
      data: {
        url: m.url,
        // name: m.name, // Bỏ comment dòng này nếu schema có trường name
        createdAt: new Date(),
      }
    })
  }
  console.log('✅ Đã tạo xong Media')

  // ==========================================
  // 3. TẠO POSTS (Lấy từ api-posts.js)
  // ==========================================
  const posts = [
    {
      title: "Tuyệt đỉnh ẩm thực đường phố Việt Nam",
      slug: "am-thuc-duong-pho-vn",
      description: "Khám phá những món ăn ngon nhất và trải nghiệm văn hóa ẩm thực độc đáo của Việt Nam.",
      content: JSON.stringify([ // Chuyển array content thành string JSON
        { type: 'heading', text: 'Phở - Món ăn quốc hồn quốc túy' },
        { type: 'paragraph', text: 'Phở là một món ăn truyền thống của Việt Nam...' },
        { type: 'image', url: 'https://i.postimg.cc/k47g213n/phovn.jpg', caption: 'Phở bò thơm ngon.' }
      ]),
      thumbnail: "https://i.postimg.cc/g0K53M1K/thumb1.jpg",
      status: "PUBLISHED",
      publishedAt: new Date("2025-12-05T10:00:00"),
      authorId: admin.id,
      commentsLocked: false,
    },
    {
      title: "Hướng dẫn tối ưu SEO cho người mới bắt đầu",
      slug: "toi-uu-seo-newbie",
      description: "Các bước cơ bản để tăng traffic tự nhiên cho blog của bạn.",
      content: JSON.stringify([
        { type: 'paragraph', text: 'SEO (Search Engine Optimization) là quá trình...' }
      ]),
      thumbnail: "https://i.postimg.cc/T3YjX84t/thumb2.jpg",
      status: "DRAFT",
      publishedAt: null,
      authorId: admin.id,
      commentsLocked: true,
    },
    {
      title: "Kế hoạch ra mắt sản phẩm mới Q1/2026",
      slug: "ke-hoach-san-pham-q1",
      description: "Chiến lược marketing và phân phối cho quý đầu năm sau.",
      content: JSON.stringify([
        { type: 'paragraph', text: 'Việc ra mắt sản phẩm cần một chiến lược bài bản...' }
      ]),
      thumbnail: null,
      status: "SCHEDULED",
      publishedAt: new Date("2026-01-15T09:30:00"),
      authorId: editor.id,
      commentsLocked: false,
    },
  ]

  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: p, 
    })
  }
  console.log('✅ Đã tạo xong Posts')

  // ==========================================
  // 4. TẠO COMMENTS (Lấy từ api-comments.js)
  // ==========================================
  
  // Lấy ID thật của bài viết vừa tạo
  const post1 = await prisma.post.findUnique({ where: { slug: "am-thuc-duong-pho-vn" } });
  const post2 = await prisma.post.findUnique({ where: { slug: "toi-uu-seo-newbie" } });
  const post3 = await prisma.post.findUnique({ where: { slug: "ke-hoach-san-pham-q1" } });

  if (post1 && post2 && post3) {
    const comments = [
      {
        postId: post1.id,
        userId: guestA.id,
        content: "Bài viết rất hay, tôi rất thích món gà rán này!",
        isHidden: false,
        createdAt: new Date("2025-12-10T14:30:00")
      },
      {
        postId: post1.id,
        userId: guestA.id, 
        content: "Thử rồi, chán, gà không giòn.",
        isHidden: true,
        createdAt: new Date("2025-12-10T15:01:00")
      },
      {
        postId: post2.id,
        userId: guestB.id,
        content: "Cảm ơn tips SEO hữu ích của admin!",
        isHidden: false,
        createdAt: new Date("2025-12-11T09:15:00")
      },
      {
        postId: post3.id,
        userId: guestC.id,
        content: "Mong chờ sản phẩm mới, hy vọng sẽ có ưu đãi.",
        isHidden: false,
        createdAt: new Date("2025-12-12T08:00:00")
      }
    ];

    for (const c of comments) {
      await prisma.comment.create({ data: c });
    }
    console.log('✅ Đã tạo xong Comments')
  }

  console.log('🏁 SEEDING HOÀN TẤT!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })