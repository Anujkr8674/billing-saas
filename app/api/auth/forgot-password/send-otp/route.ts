import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetOTP } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json({ success: true, message: "If an account with that email exists, an OTP has been sent." });
    }

    // Delete any existing OTPs for this user to ensure only latest is valid
    await prisma.oTPVerification.deleteMany({
      where: { userId: user.id },
    });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oTPVerification.create({
      data: {
        userId: user.id,
        otp,
        expiresAt,
      },
    });

    const mailResult = await sendPasswordResetOTP(email, otp);

    if (!mailResult.success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Forgot password send-otp error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
