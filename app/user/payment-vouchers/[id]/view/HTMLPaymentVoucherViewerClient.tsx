"use client";
import { useState, useRef, useEffect } from "react";
import { generatePaymentVoucherPDF } from "@/lib/paymentvoucher-pdf-generator";
import { sendPaymentVoucherEmail } from "@/app/actions/email";
import { siteAssets } from "@/lib/site-assets";
import {  Download, Edit, Printer, Mail, X, FileText, ArrowLeft , MoreVertical } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAlert } from "@/components/providers/AlertModalProvider";

export default function HTMLPaymentVoucherViewerClient({ voucher, userProfile }: { voucher: any; userProfile: any }) {
  const [downloading, setDownloading] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useAlert();

  const searchParams = useSearchParams();
  const shouldSendEmail = searchParams.get("sendEmail") === "true";

  useEffect(() => {
    if (shouldSendEmail) {
      setEmailModalOpen(true);
      if (voucher.details?.email) {
        setRecipientEmail(voucher.details.email);
      }
    }
  }, [shouldSendEmail, voucher]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const pdfBlob = await generatePaymentVoucherPDF(voucher, userProfile);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `PaymentVoucher_${voucher.docNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("PDF generation failed", error);
      showAlert("error", error.message || "Failed to generate PDF");
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
      await sendPaymentVoucherEmail(voucher, userProfile, recipientEmail);
      showAlert("success", "Payment Voucher emailed successfully!");
      setEmailModalOpen(false);
    } catch (error: any) {
      showAlert("error", error.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const d = voucher.details || {};
  const pData = userProfile?.profile || {};

  const logoUrl = (pData.companyLogo && pData.companyLogo.startsWith('http'))
    ? pData.companyLogo
    : siteAssets.logo;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20 print:block print:overflow-visible print:bg-white print:h-auto">
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 sm:py-3 px-3 sm:px-4 rounded-xl shadow-sm border border-[#5b21b6]/20 mb-6 shrink-0 print:hidden overflow-x-auto">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2 whitespace-nowrap mr-4">
            <FileText className="w-4 h-4 sm:w-6 sm:h-6 shrink-0 text-[#5b21b6]" /> Payment Overview
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 print:hidden shrink-0">
          <Link href="/user/payment-vouchers" className="text-[#5b21b6] hover:underline flex items-center gap-1.5 font-medium text-sm mr-2">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Payment Vouchers</span><span className="sm:hidden">Back</span></Link>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
            <button
            onClick={() => {
              if (voucher.details?.email) setRecipientEmail(voucher.details.email);
              setEmailModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#5b21b6] text-[#5b21b6] font-medium rounded-lg hover:bg-purple-50 transition-colors bg-white shadow-sm text-sm"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
            <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5b21b6] text-white font-medium rounded-lg hover:bg-[#5b21b6]/90 transition-colors shadow-sm disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" /> {downloading ? "Generating PDF..." : "Download PDF"}
          </button>
          </div>

          {/* Mobile Actions Dropdown */}
          <div className="md:hidden relative">
            <button 
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} 
              className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {isActionMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsActionMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 flex flex-col p-2 gap-2">
                  <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
            <button
            onClick={() => {
              if (voucher.details?.email) setRecipientEmail(voucher.details.email);
              setEmailModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#5b21b6] text-[#5b21b6] font-medium rounded-lg hover:bg-purple-50 transition-colors bg-white shadow-sm text-sm"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
            <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5b21b6] text-white font-medium rounded-lg hover:bg-[#5b21b6]/90 transition-colors shadow-sm disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" /> {downloading ? "Generating PDF..." : "Download PDF"}
          </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* HTML Document View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 relative print:block print:overflow-visible print:h-auto px-4 lg:px-0">
        <div className="min-w-[800px] md:min-w-0 max-w-5xl mx-auto bg-white text-black p-8 rounded-xl shadow-lg border border-gray-200 min-h-[1056px] relative overflow-hidden print:shadow-none print:border-none print:p-0">
          {/* Watermark */}
          {false && (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
            <h1 className="text-9xl font-black -rotate-45 whitespace-nowrap">
              {(pData.companyName || "COMPANY").toUpperCase()}
            </h1>
          </div>
        )}

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-16 object-contain mb-4" />
                ) : (
                  <div className="h-16 w-32 bg-gray-100 flex items-center justify-center text-gray-400 font-bold rounded">LOGO</div>
                )}
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-[#5b21b6] mb-1">{pData.companyName || "Your Company"}</h1>
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

            <div className="w-full h-[2px] bg-[#5b21b6] mb-6"></div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold tracking-widest text-[#5b21b6] uppercase">
                PAYMENT VOUCHER
              </h2>
            </div>
            
            <div className="w-full h-[1px] bg-gray-300 mb-8"></div>

            {/* Info Grids */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Payee Details */}
              <div className="border border-gray-200 rounded p-4 bg-white relative">
                <h3 className="font-bold text-sm text-[#5b21b6] uppercase mb-3 border-b border-gray-100 pb-2">Payee Details</h3>
                <div className="space-y-1 text-sm">
                  <p className="mb-2 flex items-center"><span className="text-gray-500 w-24 inline-block font-normal text-sm">Paid to:</span> <span className="font-bold text-base text-gray-900">{voucher.paidTo || "N/A"}</span></p>
                  {d.phone && <p><span className="text-gray-500 w-24 inline-block">Phone:</span> <span className="font-medium text-gray-900">{d.phone}</span></p>}
                  {d.email && <p><span className="text-gray-500 w-24 inline-block">Email:</span> <span className="font-medium text-gray-900">{d.email}</span></p>}
                  {d.approvedBy && <p><span className="text-gray-500 w-24 inline-block">Approved By:</span> <span className="font-medium text-gray-900">{d.approvedBy}</span></p>}
                </div>
              </div>

              {/* Payment Details */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-[#5b21b6] text-white px-4 py-2 text-sm font-bold">Payment Details</div>
                <div className="p-4 bg-white space-y-2 text-sm">
                  <p className="flex"><span className="text-gray-500 w-28">Doc No:</span> <span className="font-bold text-gray-900">{voucher.docNumber}</span></p>
                  <p className="flex"><span className="text-gray-500 w-28">Date:</span> <span className="font-bold text-gray-900">{new Date(voucher.date).toLocaleDateString("en-IN")}</span></p>
                  <p className="flex"><span className="text-gray-500 w-28">Payment Mode:</span> <span className="font-bold text-gray-900">{d.paymentMode || "Cash"}</span></p>
                  <p className="flex"><span className="text-gray-500 w-28">Ref/Cheque:</span> <span className="font-bold text-gray-900">{d.referenceNo || "N/A"}</span></p>
                  <p className="flex mt-2 pt-2 border-t border-gray-100"><span className="text-gray-500 w-28">Amount:</span> <span className="font-bold text-[#5b21b6] text-base">₹{(voucher.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
                </div>
              </div>
            </div>

            {/* Purpose and Notes */}
            <div className="space-y-6 flex-grow">
              {d.purpose && (
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Purpose of Payment:</h4>
                  <p className="text-gray-900 font-medium whitespace-pre-wrap">{d.purpose}</p>
                </div>
              )}

              {d.notes && (
                <div className="text-sm">
                  <h4 className="italic text-gray-500 mb-1">Notes:</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">{d.notes}</p>
                </div>
              )}
            </div>

            {/* Signatures */}
            <div className="flex justify-end mt-8 mb-4">
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
                <li>We request you to us 80% as advance on total amount along with your purchase order and the balance amount, on Completion of you're at loading point. The insurance premium will be paid in loading point only, before departure of your household consignment. The above rates quoted by keeping in view of our basis standard packing materials used in packing of your valued house hold articles.</li>
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
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800">Send Payment Voucher</h3>
              <button onClick={() => setEmailModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="vendor@example.com"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The Payment Voucher PDF will be generated and sent as an attachment.
              </p>
            </div>
            <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !recipientEmail}
                className="flex items-center gap-2 px-4 py-2 bg-[#5b21b6] text-white font-medium rounded-lg hover:bg-[#5b21b6]/90 transition-colors disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                {sendingEmail ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
