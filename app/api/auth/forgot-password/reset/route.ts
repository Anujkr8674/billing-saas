import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 6) {
       return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or OTP" }, { status: 400 });
    }

    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        userId: user.id,
        otp,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete used OTP
    await prisma.oTPVerification.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Forgot password reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
