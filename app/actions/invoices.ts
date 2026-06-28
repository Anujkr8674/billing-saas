"use server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getInvoices() {
  const session = await getSession();
  if (!session?.userId) return [];
  
  return await prisma.invoice.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" }
  });
}

export async function createInvoice(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const invoice = await prisma.invoice.create({
    data: {
      userId: session.userId,
      docNumber: `INV-${Date.now()}`,
      clientName: data.clientName,
      date: new Date(data.date),
      totalAmount: parseFloat(data.totalAmount || 0),
      status: data.status || "Unpaid",
      details: data.details
    }
  });

  revalidatePath("/user/invoices");
  return invoice;
}

export async function deleteInvoice(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  await prisma.invoice.delete({
    where: { id, userId: session.userId }
  });
  
  revalidatePath("/user/invoices");
}

export async function getInvoiceById(id: string) {
  const session = await getSession();
  if (!session?.userId) return null;
  return await prisma.invoice.findFirst({ where: { id, userId: session.userId } });
}

export async function updateInvoice(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  await prisma.invoice.update({
    where: { id, userId: session.userId },
    data: {
      clientName: data.clientName,
      date: new Date(data.date),
      totalAmount: parseFloat(data.totalAmount || 0),
      status: data.status || "Unpaid",
      details: data.details
    }
  });

  revalidatePath("/user/invoices");
}
