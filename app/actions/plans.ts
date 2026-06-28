"use server";
import prisma from "@/lib/prisma";

export async function getPlans() {
  return await prisma.subscriptionPlan.findMany({
    orderBy: { price: "asc" }
  });
}
