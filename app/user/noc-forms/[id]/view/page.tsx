import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNOCFormById } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import HTMLNOCFormViewerClient from "./HTMLNOCFormViewerClient";

export default async function ViewNOCFormPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const { id } = await params;
  
  const [nocForm, userProfile] = await Promise.all([
    getNOCFormById(id),
    getUserProfile()
  ]);

  if (!nocForm) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        NOC Form not found or you don't have permission to view it.
      </div>
    );
  }

  return <HTMLNOCFormViewerClient noc={nocForm} userProfile={userProfile} />;
}
