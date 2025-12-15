// FILE: app/api/media/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Cấu hình lại (để chắc chắn)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type Props = { params: Promise<{ id: string }> }

export async function DELETE(request: Request, props: Props) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);

    // 1. Tìm bản ghi trong DB để lấy URL
    const media = await prisma.media.findUnique({ where: { id } });

    if (media) {
      // 2. Xử lý xóa trên Cloudinary
      // URL mẫu: https://res.cloudinary.com/.../garan-cms/abc.jpg
      // Cần lấy public_id là: "garan-cms/abc"
      
      try {
        const urlParts = media.url.split('/');
        // Lấy tên file (có đuôi .jpg) -> ví dụ: abc.jpg
        const fileNameWithExt = urlParts[urlParts.length - 1]; 
        // Lấy folder (nếu có config folder ở bước upload) -> ví dụ: garan-cms
        const folderName = "garan-cms"; 
        
        // Tách đuôi file (.jpg) ra để lấy ID
        const publicId = `${folderName}/${fileNameWithExt.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
        console.log("Đã xóa trên Cloudinary:", publicId);
      } catch (e) {
        console.error("Lỗi xóa file trên Cloudinary (vẫn sẽ xóa DB):", e);
      }
    }

    // 3. Xóa trong Database
    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xóa" }, { status: 500 });
  }
}