import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { userId, password } = await req.json();

    if (!userId || !password || password.length < 6) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        isVerified: true
      }
    });

    // Generate JWT
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId, role: "USER", expires });

    const res = NextResponse.json({ success: true, message: "Account created successfully" });
    res.cookies.set({
      name: 'session',
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expires,
      path: '/'
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
