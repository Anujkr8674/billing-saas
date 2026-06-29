import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    // Generate Admin JWT
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId: admin.id, role: "ADMIN", expires });

    const res = NextResponse.json({ success: true, message: "Admin logged in successfully" });
    res.cookies.set({
      name: 'session',
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expires,
      path: '/'
    });

    if (admin.sidebarTheme) {
      res.cookies.set({
        name: 'adminSidebarTheme',
        value: encodeURIComponent(admin.sidebarTheme),
        path: '/',
        maxAge: 31536000
      });
    }

    if (admin.pageTheme) {
      res.cookies.set({
        name: 'adminPageTheme',
        value: encodeURIComponent(admin.pageTheme),
        path: '/',
        maxAge: 31536000
      });
    }

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
