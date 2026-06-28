import { getMoneyReceiptById } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { getSession } from "@/lib/auth";
import HTMLMoneyReceiptViewerClient from "./HTMLMoneyReceiptViewerClient";
import { notFound } from "next/navigation";

export default async function ViewMoneyReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return <div>Unauthorized</div>;

  const { id } = await params;
  const receipt = await getMoneyReceiptById(id);
  
  if (!receipt || receipt.userId !== session.userId) {
    return notFound();
  }

  const userProfile = await getUserProfile();

  return <HTMLMoneyReceiptViewerClient receipt={receipt} userProfile={userProfile} />;
}
