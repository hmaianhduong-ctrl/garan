import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email này đã được sử dụng!" }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password, 
        name,
        role: 'VIEWER',
      }
    });

    return NextResponse.json({ 
      message: "Đăng ký thành công!", 
      user: { id: newUser.id, email: newUser.email } 
    }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}