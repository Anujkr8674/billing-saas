import { getUserProfile } from "@/app/actions/user";
import ClientLayout from "./ClientLayout";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  
  if (!profile || profile.role !== "admin") {
    redirect("/admin");
  }

  return (
    <ClientLayout userProfile={profile}>
      {children}
    </ClientLayout>
  );
}
