import { getLoadingSlipById } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { notFound } from "next/navigation";
import HTMLLoadingSlipViewerClient from "./HTMLLoadingSlipViewerClient";

export default async function ViewLoadingSlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const loadingSlip = await getLoadingSlipById(id);
  if (!loadingSlip) return notFound();

  const userProfile = await getUserProfile();

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden print:block print:h-auto print:overflow-visible">
      <HTMLLoadingSlipViewerClient loadingSlip={loadingSlip} userProfile={userProfile} />
    </div>
  );
}
