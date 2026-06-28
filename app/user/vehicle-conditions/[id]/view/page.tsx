import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVehicleConditionById } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import VehicleConditionViewerClient from "./VehicleConditionViewerClient";

export default async function ViewVehicleConditionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const { id } = await params;
  
  const [doc, userProfile] = await Promise.all([
    getVehicleConditionById(id),
    getUserProfile()
  ]);

  if (!doc || doc.userId !== session.userId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Vehicle Condition Report not found or you don't have permission to view it.
      </div>
    );
  }

  return <VehicleConditionViewerClient doc={doc} userProfile={userProfile} />;
}
