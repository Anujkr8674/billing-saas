"use client";

import { useState } from "react";
import {  Download, Mail, ArrowLeft, Send, FileText, Printer , MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateLoadingSlipPDF } from "@/lib/loadingslip-pdf-generator";
import AlertModal from "@/components/ui/AlertModal";
import { sendLoadingSlipEmail } from "@/app/actions/email";
import { siteAssets } from "@/lib/site-assets";
import { useAlert } from "@/components/providers/AlertModalProvider";

export default function HTMLLoadingSlipViewerClient({ loadingSlip, userProfile }: { loadingSlip: any, userProfile: any }) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTo, setEmailTo] = useState(loadingSlip.details?.email || "");
  const { showAlert } = useAlert();

  // Ensure document title is set for printing headers/footers
  if (typeof document !== "undefined") {
    document.title = `Loading Slip Document - ${loadingSlip?.docNumber || 'New'}`;
  }

  const d = loadingSlip.details || {};
  const pData = userProfile?.profile || {};
  const hasWatermark = userProfile?.hasWatermark !== false;
  const compName = pData.companyName || "COMPANY NAME PVT. LTD.";

  const fmtAmt = (num: number) => num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const pdfBase64 = await generateLoadingSlipPDF(loadingSlip, userProfile);
      const link = document.createElement("a");
      link.href = pdfBase64;
      link.download = `LoadingSlip_${loadingSlip.docNumber || "LS"}.pdf`;
      link.click();
    } catch (e) {
      console.error(e);
      showAlert("error", "Failed to generate PDF");
    }
    setDownloading(false);
  };

  const handleSendEmail = async () => {
    if (!emailTo) {
      showAlert("error", "Please enter an email address", "Missing Information");
      return;
    }
    setSending(true);
    try {
      await sendLoadingSlipEmail(loadingSlip, userProfile, emailTo);
      showAlert("success", "Loading slip sent successfully!");
      setShowEmailDialog(false);
    } catch (e: any) {
      console.error(e);
      showAlert("error", e.message || "Failed to send email.");
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20 print:block print:overflow-visible print:bg-white print:h-auto">
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 sm:py-3 px-3 sm:px-4 rounded-xl shadow-sm border border-[#5b21b6]/20 mb-6 shrink-0 print:hidden overflow-x-auto">
        <div>
          <h1 className="text-sm sm:text-2xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2 truncate whitespace-nowrap">
            <FileText className="w-6 h-6 text-primary" /> Loading Slip — Overview
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 print:hidden shrink-0">
          <Link href="/user/loading-slips" className="text-primary hover:underline flex items-center gap-1 sm:gap-2 font-medium text-sm mr-2 sm:mr-4">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Loading Slips</span><span className="sm:hidden">Back</span></Link>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
            <button 
            onClick={() => setShowEmailDialog(true)}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-[#1e40af] text-[#1e40af] font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-sm"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
            <button 
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2 bg-[#1e40af] text-white font-medium rounded-lg hover:bg-[#1e40af]/90 transition-colors shadow-sm disabled:opacity-50 text-sm"
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
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
            <button 
            onClick={() => setShowEmailDialog(true)}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-[#1e40af] text-[#1e40af] font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-sm"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
            <button 
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2 bg-[#1e40af] text-white font-medium rounded-lg hover:bg-[#1e40af]/90 transition-colors shadow-sm disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" /> {downloading ? "Generating PDF..." : "Download PDF"}
          </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showEmailDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-border bg-muted/20">
              <h3 className="font-semibold text-lg text-foreground">Send Loading Slip via Email</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Recipient Email</label>
                <input 
                  type="email" 
                  value={emailTo} 
                  onChange={e => setEmailTo(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:ring-1 focus:ring-primary outline-none"
                  placeholder="customer@example.com"
                />
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
              <button 
                onClick={() => setShowEmailDialog(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={sending || !emailTo}
                className="flex items-center gap-2 px-4 py-2 bg-[#5b21b6] text-white text-sm font-medium rounded-md hover:bg-[#5b21b6]/90 disabled:opacity-50"
              >
                {sending ? "Sending..." : <><Send className="w-4 h-4" /> Send Email</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HTML Document View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 relative print:block print:overflow-visible print:h-auto">
        <div className="min-w-[800px] md:min-w-0 max-w-5xl mx-auto bg-white shadow-xl rounded-sm border border-gray-200 relative overflow-hidden print:overflow-visible print:h-auto print:border-none print:shadow-none min-h-[1122px] print:!min-h-0 p-[40px_50px]">
        
        {/* Watermark overlay */}
        {false && hasWatermark && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden" style={{ zIndex: 0 }}>
            <div className="text-[120px] font-bold text-gray-200/40 -rotate-45 select-none flex flex-col items-center leading-none">
              <span>NEXTGEN</span>
              <span>BILLING</span>
            </div>
          </div>
        )}

        {/* Content (z-index ensures it sits above watermark) */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              {userProfile?.companyLogo || siteAssets?.logo ? (
                <img src={userProfile?.companyLogo || siteAssets?.logo} alt="Logo" className="h-16 object-contain" />
              ) : (
                <div className="h-16 w-32 bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl rounded">LOGO</div>
              )}
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-[#5b21b6] mb-1">{pData.companyName || "COMPANY NAME PVT. LTD."}</h1>
              <p className="text-xs text-gray-600 mb-1">
                {pData.addressLine1} {pData.addressLine2 ? `, ${pData.addressLine2}` : ""}
              </p>
              <p className="text-xs text-gray-600 mb-1">
                {pData.city ? `${pData.city}, ` : ""}{pData.state} {pData.pincode}
              </p>
              <p className="text-xs text-gray-600 mb-1">
                {pData.gstNumber && `GSTIN: ${pData.gstNumber}`} {pData.panCardNumber && ` | PAN: ${pData.panCardNumber}`}
              </p>
              <p className="text-xs text-gray-600">
                Phone: {pData.mobileNumber || userProfile?.mobile || "N/A"} | Email: {pData.email || userProfile?.email || "N/A"}
              </p>
            </div>
          </div>

          <div className="w-full h-[2px] bg-[#5b21b6] mb-6"></div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold tracking-widest text-[#5b21b6]">LOADING SLIP</h2>
          </div>

          <div className="w-full h-[1px] bg-gray-300 mb-8"></div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-bold text-sm text-[#5b21b6] uppercase mb-3 border-b border-gray-100 pb-2">Document Info</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex"><span className="w-32 font-medium text-gray-600">Doc Number:</span> <span>{loadingSlip.docNumber || "N/A"}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">Date:</span> <span>{new Date(loadingSlip.date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span></div>
              </div>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-bold text-sm text-[#5b21b6] uppercase mb-3 border-b border-gray-100 pb-2">Goods Owner Details</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex"><span className="w-24 font-medium text-gray-600">Name:</span> <span className="font-bold">{d.ownerName || "N/A"}</span></div>
                <div className="flex"><span className="w-24 font-medium text-gray-600">Phone:</span> <span>{d.phone || "N/A"}</span></div>
                <div className="flex"><span className="w-24 font-medium text-gray-600">Email:</span> <span>{d.email || "N/A"}</span></div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded p-4 mb-6">
             <h3 className="font-bold text-sm text-[#5b21b6] uppercase mb-3 border-b border-gray-100 pb-2">Vehicle, Route & Driver</h3>
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1.5">
                  <div className="flex"><span className="w-24 font-medium text-gray-600">Vehicle No:</span> <span className="font-bold">{loadingSlip.vehicleNo || d.vehicleNo || "N/A"}</span></div>
                  <div className="flex"><span className="w-24 font-medium text-gray-600">From:</span> <span>{d.fromCity || "N/A"}</span></div>
                  <div className="flex"><span className="w-24 font-medium text-gray-600">Driver Name:</span> <span>{loadingSlip.driverName || d.driverName || "N/A"}</span></div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex"><span className="w-24 font-medium text-gray-600">Size:</span> <span>{d.vehicleSize || "N/A"}</span></div>
                  <div className="flex"><span className="w-24 font-medium text-gray-600">To:</span> <span>{d.toCity || "N/A"}</span></div>
                  <div className="flex"><span className="w-24 font-medium text-gray-600">Driver Mob:</span> <span>{d.driverMobile || "N/A"}</span></div>
                </div>
             </div>
          </div>

          {(d.items && d.items.length > 0) && (
            <div className="mb-6">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-[#5b21b6] text-white">
                    <th className="border border-gray-300 px-3 py-2 text-center w-12">#</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Item / Particulars</th>
                    <th className="border border-gray-300 px-3 py-2 text-center w-20">Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-center w-32">Condition</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {d.items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-3 py-2 text-center">{i + 1}</td>
                      <td className="border border-gray-300 px-3 py-2">{item.name}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{item.condition}</td>
                      <td className="border border-gray-300 px-3 py-2">{item.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border border-gray-200 rounded p-4 mb-6">
             <h3 className="font-bold text-sm text-[#5b21b6] uppercase mb-3 border-b border-gray-100 pb-2">Freight & Charges</h3>
             <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1.5">
                  <div className="flex"><span className="w-24 font-medium text-gray-600">Weight:</span> <span>{d.weight || "N/A"}</span></div>
                  <div className="flex"><span className="w-24 font-medium text-gray-600">Advance (₹):</span> <span>{fmtAmt(Number(d.advance) || 0)}</span></div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex"><span className="w-24 font-medium text-gray-600">Rate:</span> <span>{d.rate || "N/A"}</span></div>
                  <div className="flex"><span className="w-24 font-medium text-gray-600">Balance (₹):</span> <span>{fmtAmt(Number(d.balance) || 0)}</span></div>
                </div>
                <div className="space-y-1.5 border-l border-gray-200 pl-4">
                  <div className="flex justify-between font-bold text-lg text-[#5b21b6]"><span className="font-medium text-gray-600 text-sm mt-1">Freight:</span> ₹{fmtAmt(Number(d.freight) || 0)}</div>
                </div>
             </div>
          </div>

          <div className="border border-gray-200 rounded p-4 mb-6 text-sm">
            <h3 className="font-bold text-sm text-[#5b21b6] uppercase mb-3 border-b border-gray-100 pb-2">Detention & Notes</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex"><span className="w-32 font-medium text-gray-600">Detention Charge:</span> <span>₹{fmtAmt(Number(d.detentionCharge) || 0)}</span></div>
              <div className="flex"><span className="w-32 font-medium text-gray-600">Detention Type:</span> <span>{d.detentionType || "N/A"}</span></div>
            </div>
            {d.notes && (
              <div className="mt-3">
                <span className="font-medium text-gray-600 block mb-1">Notes:</span>
                <p className="text-gray-800 whitespace-pre-wrap">{d.notes}</p>
              </div>
            )}
          </div>

          </div>
          
          {/* Signature & Stamp */}
          <div className="flex justify-end mt-8 mb-4">
            <div className="text-center w-64">
              <p className="font-bold text-sm mb-2">For {compName}</p>
                <div className="flex flex-col items-center justify-center min-h-16 mb-2">
                  {(userProfile?.companyStamp || pData?.companyStamp) && (
                    <img src={userProfile?.companyStamp || pData?.companyStamp} alt="Stamp" className="max-h-20 max-w-24" />
                  )}
                  {(userProfile?.authorizedSignature || pData?.authorizedSignature) && (
                    <img src={userProfile?.authorizedSignature || pData?.authorizedSignature} alt="Signature" className="max-h-16 max-w-48" />
                  )}
                  {!(userProfile?.companyStamp || pData?.companyStamp) && !(userProfile?.authorizedSignature || pData?.authorizedSignature) && (
                    <div className="h-10 w-full border-b border-dashed border-gray-300"></div>
                  )}
                </div>
              <p className="text-xs font-bold text-gray-600">Authorized Signatory</p>
            </div>
          </div>

          {/* General T&C Section */}
          <div className="mt-8">
            <div className="text-xs text-center text-gray-500 font-bold bg-gray-100 py-3 mb-6">
              This is a computer-generated document. SAVE PAPER - SAVE TREES | BE DIGITAL - GO GREEN
            </div>

            <div className="text-sm text-center text-white font-bold bg-[#5b21b6] py-3 mb-8 rounded-sm">
              For Any Query contact us: Mob.: {pData.mobileNumber || userProfile?.mobile || ""}
            </div>

            <h4 className="text-[#5b21b6] font-bold text-xl mb-2">Term & Conditions:</h4>
            <div className="border-t-2 border-[#5b21b6] mb-4 w-full"></div>
            
            <ol className="list-decimal pl-5 text-xs space-y-2 text-gray-800">
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
              <li>Payment will be in the favour of {compName} by Cash/Cheque.</li>
              <li>Thanking you and awaiting for your valued work order to serve you.</li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}
