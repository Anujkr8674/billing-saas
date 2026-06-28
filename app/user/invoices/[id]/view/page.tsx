import { getInvoiceById } from "@/app/actions/invoices";
import { getUserProfile } from "@/app/actions/user";
import HTMLInvoiceViewerClient from "./HTMLInvoiceViewerClient";

export default async function ViewInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  const profile = await getUserProfile();

  if (!invoice) {
    return <div className="p-8 text-center text-danger font-medium">Invoice not found.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden print:block print:h-auto print:overflow-visible">
      <HTMLInvoiceViewerClient invoice={invoice} profile={profile} />
    </div>
  );
}
