import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOTP } from '@/lib/mail';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, mobile } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Upsert unverified user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, mobile },
      create: {
        name,
        email,
        mobile,
        passwordHash: "", // Will be set later
      }
    });

    // Save OTP
    await prisma.oTPVerification.create({
      data: {
        userId: user.id,
        otp,
        expiresAt
      }
    });

    // Send email
    await sendOTP(email, otp);

    return NextResponse.json({ success: true, message: "OTP sent to email", userId: user.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
