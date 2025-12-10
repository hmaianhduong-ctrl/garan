import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    // Kiểm tra file hợp lệ
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Tạo tên file duy nhất (Timestamp + Tên gốc)
    const filename = `${Date.now()}_${file.name.replaceAll(" ", "_")}`;
    
    // Đường dẫn lưu file: public/uploads
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Tạo thư mục nếu chưa có
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        console.error("Lỗi tạo thư mục upload:", e);
    }

    // Ghi file vào ổ cứng
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Trả về đường dẫn ảnh
    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}`,
      message: "Upload thành công!"
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Lỗi xử lý file phía Server" }, { status: 500 });
  }
}