import { getPaymentVoucherById } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { getSession } from "@/lib/auth";
import HTMLPaymentVoucherViewerClient from "./HTMLPaymentVoucherViewerClient";
import { notFound } from "next/navigation";

export default async function ViewPaymentVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return <div>Unauthorized</div>;

  const { id } = await params;
  const voucher = await getPaymentVoucherById(id);
  
  if (!voucher || voucher.userId !== session.userId) {
    return notFound();
  }

  const userProfile = await getUserProfile();

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden print:block print:h-auto print:overflow-visible">
      <HTMLPaymentVoucherViewerClient voucher={voucher} userProfile={userProfile} />
    </div>
  );
}
