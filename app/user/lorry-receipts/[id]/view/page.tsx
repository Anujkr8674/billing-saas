import { getLorryReceiptById } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { notFound } from "next/navigation";
import HTMLLorryReceiptViewerClient from "./HTMLLorryReceiptViewerClient";

export default async function ViewLorryReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLorryReceiptById(id);
  const userProfile = await getUserProfile();

  if (!data) return notFound();

  return <HTMLLorryReceiptViewerClient lorryReceipt={data} userProfile={userProfile} />;
}
