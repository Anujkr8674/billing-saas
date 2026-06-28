import { getQuotationById } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import HTMLQuotationViewerClient from "./HTMLQuotationViewerClient";

export default async function ViewQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = await getQuotationById(id);
  const profile = await getUserProfile();

  if (!quotation) {
    return <div className="p-8 text-center text-danger font-medium">Quotation not found.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden print:block print:h-auto print:overflow-visible">
      <HTMLQuotationViewerClient quotation={quotation} profile={profile} />
    </div>
  );
}
