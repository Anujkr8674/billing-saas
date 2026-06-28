"use client";
import { useState, useRef, useEffect } from "react";
import { generateNOCFormPDF } from "@/lib/noc-pdf-generator";
import { sendNOCEmail } from "@/app/actions/email"; // To be created
import { siteAssets } from "@/lib/site-assets";
import { Download, Edit, Printer, Mail, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAlert } from "@/components/providers/AlertModalProvider";
import { FileText, ArrowLeft, Send } from "lucide-react";

export default function HTMLNOCFormViewerClient({ noc, userProfile }: { noc: any; userProfile: any }) {
  const [downloading, setDownloading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(noc.details?.email || "");
  const [sendingEmail, setSendingEmail] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useAlert();
  
  const searchParams = useSearchParams();
  const shouldSendEmail = searchParams.get("sendEmail") === "true";

  useEffect(() => {
    if (shouldSendEmail) {
      setIsEmailModalOpen(true);
      if (noc.details?.email) {
        setRecipientEmail(noc.details.email);
      }
    }
  }, [shouldSendEmail, noc]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const pdfBlob = await generateNOCFormPDF(noc, userProfile);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NOC_${noc.docNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed", error);
      showAlert("error", "Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) return showAlert("error", "Please enter an email address");
    setSendingEmail(true);
    try {
      await sendNOCEmail(noc, userProfile, recipientEmail);
      showAlert("success", "Email sent successfully!");
      setIsEmailModalOpen(false);
    } catch (error: any) {
      showAlert("error", error.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const d = noc.details || {};
  const pData = userProfile?.profile || {};

  const logoUrl = (pData.companyLogo && pData.companyLogo.startsWith('http')) 
    ? pData.companyLogo 
    : siteAssets.logo;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20 print:block print:overflow-visible print:bg-white print:h-auto">
      <div className="flex items-center justify-between mb-4 shrink-0 px-2 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#5b21b6]" /> View NOC Form
          </h1>
        </div>
        <div className="flex flex-nowrap whitespace-nowrap items-center gap-4 print:hidden overflow-x-auto custom-scrollbar pb-1">
          <Link href="/user/noc-forms" className="text-[#5b21b6] hover:underline flex items-center gap-2 font-medium text-sm mr-4">
            <ArrowLeft className="w-4 h-4" /> Back to NOC Forms
          </Link>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button 
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#5b21b6] text-[#5b21b6] font-medium rounded-lg hover:bg-purple-50 transition-colors shadow-sm text-sm"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5b21b6] text-white font-medium rounded-lg hover:bg-[#5b21b6]/90 transition-colors shadow-sm disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" /> 
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* HTML Document View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 relative print:block print:overflow-visible print:h-auto px-4 lg:px-0">
        <div 
          ref={printRef}
          className="max-w-5xl mx-auto bg-white text-black p-8 sm:p-12 min-h-[1056px] shadow-lg print:shadow-none print:border-none print:p-0 border border-gray-200 relative overflow-hidden"
        >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
          <h1 className="text-9xl font-black -rotate-45 whitespace-nowrap">
            {(pData.companyName || "COMPANY").toUpperCase()}
          </h1>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-100">
            <div>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-16 object-contain mb-4" />
              ) : (
                <div className="h-16 w-32 bg-gray-100 flex items-center justify-center text-gray-400 font-bold rounded">LOGO</div>
              )}
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{pData.companyName || "Your Company"}</h1>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                {pData.addressLine1 && <p>{pData.addressLine1}{pData.addressLine2 ? `, ${pData.addressLine2}` : ''}</p>}
                {pData.city && <p>{pData.city}, {pData.state} {pData.pincode}</p>}
                
                <div className="pt-2 flex flex-col gap-0.5 text-xs text-gray-500">
                  {pData.gstNumber && <p>GSTIN: {pData.gstNumber}</p>}
                  {pData.panCardNumber && <p>PAN: {pData.panCardNumber}</p>}
                  {pData.mobileNumber && <p>Phone: {pData.mobileNumber}</p>}
                  {pData.email && <p>Email: {pData.email}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="bg-slate-900 text-white py-2 px-6 rounded-md inline-block mx-auto mb-10 text-center shadow-sm">
            <h2 className="text-lg font-bold tracking-widest">NO OBJECTION CERTIFICATE (NOC)</h2>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div className="space-y-2">
              <div className="flex">
                <span className="font-semibold w-28 text-slate-800">Document No:</span>
                <span className="text-gray-700">{noc.docNumber || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-28 text-slate-800">LR / Bilty No:</span>
                <span className="text-gray-700">{d.lrNo || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-semibold w-28 text-slate-800">NOC Date:</span>
                <span className="text-gray-700">{noc.date ? new Date(noc.date).toLocaleDateString("en-IN") : "N/A"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-28 text-slate-800">LR Date:</span>
                <span className="text-gray-700">{d.lrDate ? new Date(d.lrDate).toLocaleDateString("en-IN") : "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Party Details Table */}
          <div className="mb-6 rounded-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Party Details</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="w-1/3 py-2 px-4 bg-slate-50 font-semibold text-slate-800">Client / Consignor Name</td>
                  <td className="py-2 px-4">{noc.clientName || "N/A"}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="w-1/3 py-2 px-4 bg-slate-50 font-semibold text-slate-800">Phone / WhatsApp</td>
                  <td className="py-2 px-4">{d.phone || "N/A"}</td>
                </tr>
                <tr>
                  <td className="w-1/3 py-2 px-4 bg-slate-50 font-semibold text-slate-800">Email Address</td>
                  <td className="py-2 px-4">{d.email || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Route & Document Details Table */}
          <div className="mb-8 rounded-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Route & Document Details</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="w-1/3 py-2 px-4 bg-slate-50 font-semibold text-slate-800">Origin City</td>
                  <td className="py-2 px-4">{d.fromCity || "N/A"}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="w-1/3 py-2 px-4 bg-slate-50 font-semibold text-slate-800">Destination City</td>
                  <td className="py-2 px-4">{d.toCity || "N/A"}</td>
                </tr>
                <tr>
                  <td className="w-1/3 py-2 px-4 bg-slate-50 font-semibold text-slate-800">NOC Type</td>
                  <td className="py-2 px-4">{d.nocType || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {d.notes && (
            <div className="mb-auto">
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Notes / Remarks:</h4>
              <p className="text-gray-600 text-sm italic whitespace-pre-wrap leading-relaxed">{d.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="flex justify-between mt-8 mb-4">
            <div className="text-center w-64 flex flex-col justify-end">
              <div className="h-12 border-b border-gray-400 w-full mb-2"></div>
              <p className="text-sm font-bold text-gray-600">Customer&apos;s Signature</p>
            </div>
            
            <div className="text-center w-64">
              <p className="font-bold text-sm mb-2">For {pData.companyName || "Your Company"}</p>
              <div className="flex flex-col items-center justify-center min-h-16 mb-2 gap-1">
                {userProfile?.companyStamp && (
                  <img src={userProfile.companyStamp} alt="Company Stamp" className="max-h-20 max-w-24 object-contain" />
                )}
                {pData.authorizedSignature ? (
                  <img src={pData.authorizedSignature} alt="Signature" className="max-h-16 max-w-48 object-contain" />
                ) : (
                  <div className="h-12 border-b border-gray-400 w-full"></div>
                )}
              </div>
              <p className="text-xs font-bold text-gray-600">Authorized Signatory</p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mt-8 border-t border-[#5b21b6] pt-6">
            <h3 className="text-[#5b21b6] font-bold text-lg mb-4">Terms & Conditions:</h3>
            <ol className="list-decimal pl-5 text-xs text-gray-600 space-y-2">
              <li>We do not undertake Electrical, Carpentry & Plumber Job.</li>
              <li>The Vehicle transportation charges as given above as based on the present prevailing market rate.</li>
              <li>We or our agent shall be exempted from any kind of loss or damage done due to accident, pilferage, fire, rain collision or any other road/rive.</li>
              <li>Hazard Or any natural claim. So to avoid loss or damage we advise you to insure your consignment covering all risk. Please be noted while carrier</li>
              <li>Risk. On individual policy/receipt, from the insurance Company will be given.</li>
              <li>We request you to us 80% as advance on total amount along with your purchase order and the balance amount, on Completion of you&apos;re at loading point. The insurance premium will be paid in loading point only, before departure of your household consignment. The above rates quoted by keeping in view of our basis standard packing materials used in packing of your valued house hold articles.</li>
              <li>If required we also provide storage facility to our customer at very nominal charge.</li>
              <li>We would be thankful, if you could give us prior intimation of 4-5 days in advance to start the packing of your valued articles. Car should have at least 10 Litters of Petrol.</li>
              <li>Extra payment will be charged for Wooden Packing on Moving Date.</li>
              <li>We are not responsible for Gold & Cash. Please keep in your custody lock.</li>
              <li>Interest will be charged @24% Per annum if the payment is not made within 15 days.</li>
              <li>Payment will be in the favour of {pData.companyName || "Your Company"} by Cash/Cheque.</li>
              <li>All disputes are subject to Ranchi Jurisdiction.</li>
            </ol>
          </div>
        </div>
      </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Send NOC Form</h3>
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                <input 
                  type="email" 
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                />
              </div>
              <p className="text-xs text-gray-500">
                The NOC Form PDF will be generated and sent as an attachment.
              </p>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="px-4 py-2 bg-[#5b21b6] text-white rounded-lg hover:bg-[#5b21b6]/90 transition-colors text-sm font-medium flex items-center gap-2"
              >
                {sendingEmail ? "Sending..." : <><Mail className="w-4 h-4" /> Send Email</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
