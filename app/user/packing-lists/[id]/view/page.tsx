import { getPackingListById } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { notFound } from "next/navigation";
import HTMLPackingListViewerClient from "./HTMLPackingListViewerClient";

export default async function ViewPackingListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPackingListById(id);
  const userProfile = await getUserProfile();

  if (!data) return notFound();

  return <HTMLPackingListViewerClient packingList={data} userProfile={userProfile} />;
}
