import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function POST(request: Request) {
  console.log("🚀 Bắt đầu nhận request Upload..."); // Log 1

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      console.log("❌ Lỗi: Không tìm thấy file trong FormData"); // Log lỗi
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    console.log(`📂 Đang xử lý file: ${file.name} (${file.size} bytes)`); // Log 2

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Tạo tên file
    const filename = `${Date.now()}_${file.name.replaceAll(" ", "_")}`;
    
    // Đường dẫn thư mục (Dùng process.cwd() chuẩn cho Next.js)
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // 1. Cố gắng tạo thư mục (Nếu chưa có)
    try {
        await mkdir(uploadDir, { recursive: true });
        console.log("✅ Đã kiểm tra/tạo thư mục uploads"); // Log 3
    } catch (e) {
        console.error("❌ Lỗi tạo thư mục:", e);
    }

    // 2. Ghi file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    console.log(`✅ Đã ghi file thành công tại: ${filePath}`); // Log 4

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}`,
      message: "Upload thành công!"
    });

  } catch (error) {
    console.error("❌ LỖI CRASH SERVER:", error); // Log 5 (Quan trọng nhất)
    return NextResponse.json({ error: "Lỗi xử lý file phía Server" }, { status: 500 });
  }
}