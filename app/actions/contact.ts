"use server";

import prisma from "@/lib/prisma";
import { sendContactConfirmationEmail } from "@/lib/mail";

export async function submitContactForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  contactNo?: string;
  subject?: string;
  message: string;
}) {
  try {
    if (!data.firstName || !data.lastName || !data.email || !data.message) {
      return { success: false, error: "All fields are required" };
    }

    await prisma.contactMessage.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNo: data.contactNo,
        subject: data.subject,
        message: data.message,
      },
    });

    // Send confirmation email asynchronously without blocking the return
    sendContactConfirmationEmail(data.email, data.firstName).catch((err) => {
      console.error("Failed to send contact confirmation email inside action:", err);
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
