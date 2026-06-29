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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isVerified) {
      return NextResponse.json({ error: "Invalid credentials or unverified account" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId: user.id, role: "USER", expires });

    const userProfile = await prisma.userProfile.findUnique({ where: { userId: user.id } });

    const res = NextResponse.json({ success: true, message: "Logged in successfully" });
    res.cookies.set({
      name: 'session',
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expires,
      path: '/'
    });

    if (userProfile?.sidebarTheme) {
      res.cookies.set({
        name: 'userSidebarTheme',
        value: encodeURIComponent(userProfile.sidebarTheme),
        path: '/',
        maxAge: 31536000
      });
    }

    if (userProfile?.pageTheme) {
      res.cookies.set({
        name: 'userPageTheme',
        value: encodeURIComponent(userProfile.pageTheme),
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
