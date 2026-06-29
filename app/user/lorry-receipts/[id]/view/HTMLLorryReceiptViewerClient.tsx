"use client";

import { useState } from "react";
import {  Download, Mail, ArrowLeft, Printer, X, FileText , MoreVertical } from "lucide-react";
import Link from "next/link";
import { siteAssets } from "@/lib/site-assets";
import { useAlert } from "@/components/providers/AlertModalProvider";

export default function HTMLLorryReceiptViewerClient({ lorryReceipt, userProfile }: { lorryReceipt: any, userProfile: any }) {
  const [downloading, setDownloading] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(lorryReceipt.details?.consignorEmail || "");
  const { showAlert } = useAlert();

  const pData = userProfile?.profile || {};
  const d = lorryReceipt.details || {};
  
  const hasWatermark = userProfile?.subscription?.plan?.hasWatermark ?? true;
  const companyName = pData.companyName || "COMPANY NAME PVT. LTD.";
  const logoUrl = (pData.companyLogo && pData.companyLogo.startsWith('http')) 
    ? pData.companyLogo 
    : siteAssets.logo;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { generateLorryReceiptPDF } = await import("@/lib/lorryreceipt-pdf-generator");
      const pdfBlob = await generateLorryReceiptPDF(lorryReceipt, userProfile);
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `LR_${lorryReceipt.docNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      showAlert("error", err.message || "Failed to generate PDF");
    }
    setDownloading(false);
  };

  const handleEmailClick = () => {
    setEmailInput(d.consignorEmail || "");
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailInput) return;
    setEmailing(true);
    try {
      const { sendLorryReceiptEmail } = await import("@/app/actions/email");
      await sendLorryReceiptEmail(lorryReceipt, userProfile, emailInput);
      showAlert("success", "Lorry Receipt emailed successfully!");
      setIsEmailModalOpen(false);
    } catch (err: any) {
      showAlert("error", err.message || "Failed to send email");
    }
    setEmailing(false);
  };

  const fmtAmt = (amt: any) => Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20 print:block print:overflow-visible print:bg-white print:h-auto">
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 sm:py-3 px-3 sm:px-4 rounded-xl shadow-sm border border-[#5b21b6]/20 mb-6 shrink-0 print:hidden overflow-x-auto">
        <div>
          <h1 className="text-sm sm:text-2xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2 truncate whitespace-nowrap">
            <FileText className="w-4 h-4 sm:w-6 sm:h-6 shrink-0 text-[#5b21b6]" /> View Lorry Receipt
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 print:hidden shrink-0">
          <Link href="/user/lorry-receipts" className="text-[#5b21b6] hover:underline flex items-center gap-1 sm:gap-2 font-medium text-sm mr-2 sm:mr-4">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Lorry Receipts</span><span className="sm:hidden">Back</span></Link>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
            <button 
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-[#5b21b6] text-[#5b21b6] font-medium rounded-lg hover:bg-purple-50 transition-colors shadow-sm text-sm"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
            <button 
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2 bg-[#5b21b6] text-white font-medium rounded-lg hover:bg-[#5b21b6]/90 transition-colors shadow-sm disabled:opacity-50 text-sm"
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
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-[#5b21b6] text-[#5b21b6] font-medium rounded-lg hover:bg-purple-50 transition-colors shadow-sm text-sm"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
            <button 
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2 bg-[#5b21b6] text-white font-medium rounded-lg hover:bg-[#5b21b6]/90 transition-colors shadow-sm disabled:opacity-50 text-sm"
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
        
        {/* Watermark overlay */}
        {false && hasWatermark && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden" style={{ zIndex: 0 }}>
            <div className="text-[120px] font-bold text-gray-200/40 -rotate-45 select-none flex flex-col items-center leading-none">
              <span>NEXTGEN</span>
              <span>BILLING</span>
            </div>
          </div>
        )}

        <div className="relative z-10">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              {pData?.companyLogo || siteAssets?.logo ? (
                <img src={pData?.companyLogo || siteAssets?.logo} alt="Logo" className="h-16 object-contain" />
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
            <h2 className="text-xl font-bold tracking-widest text-[#5b21b6] uppercase">LORRY RECEIPT / BILTY</h2>
          </div>

          <div className="w-full h-[1px] bg-gray-300 mb-8"></div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-bold text-sm text-[#5b21b6] uppercase mb-3 border-b border-gray-100 pb-2">Consignor (Sender)</h3>
              <div className="text-sm space-y-1">
                <p className="font-bold text-base">{d.consignorName || lorryReceipt.consignor || "N/A"}</p>
                {d.consignorPhone && <p className="text-gray-600"><span className="font-medium text-gray-800">Phone:</span> {d.consignorPhone}</p>}
                {d.consignorEmail && <p className="text-gray-600"><span className="font-medium text-gray-800">Email:</span> {d.consignorEmail}</p>}
                {d.consignorGST && <p className="text-gray-600"><span className="font-medium text-gray-800">GSTIN:</span> {d.consignorGST}</p>}
                {d.consignorAddress && <p className="text-gray-600 mt-2">{d.consignorAddress}</p>}
              </div>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-bold text-sm text-[#5b21b6] uppercase mb-3 border-b border-gray-100 pb-2">Consignee (Receiver)</h3>
              <div className="text-sm space-y-1">
                <p className="font-bold text-base">{d.consigneeName || lorryReceipt.consignee || "N/A"}</p>
                {d.consigneePhone && <p className="text-gray-600"><span className="font-medium text-gray-800">Phone:</span> {d.consigneePhone}</p>}
                {d.consigneeGST && <p className="text-gray-600"><span className="font-medium text-gray-800">GSTIN:</span> {d.consigneeGST}</p>}
                {d.consigneeAddress && <p className="text-gray-600 mt-2">{d.consigneeAddress}</p>}
              </div>
            </div>
          </div>

          {/* Document & Route Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="bg-[#5b21b6] text-white px-4 py-2 text-sm font-bold">Document & Route Info</div>
              <div className="p-4 text-sm space-y-2">
                <div className="flex"><span className="w-32 font-medium text-gray-600">Doc No:</span> <span>{lorryReceipt.docNumber}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">Date:</span> <span>{new Date(lorryReceipt.date).toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">From:</span> <span>{d.fromCity || "N/A"}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">To:</span> <span>{d.toCity || "N/A"}</span></div>
              </div>
            </div>
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="bg-[#5b21b6] text-white px-4 py-2 text-sm font-bold">Transport Info</div>
              <div className="p-4 text-sm space-y-2">
                <div className="flex"><span className="w-32 font-medium text-gray-600">Vehicle No:</span> <span>{d.vehicleNo || "N/A"}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">Driver Name:</span> <span>{d.driverName || "N/A"}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">Driver Phone:</span> <span>{d.driverPhone || "N/A"}</span></div>
              </div>
            </div>
          </div>

          {/* Goods Details */}
          <div className="border border-gray-200 rounded overflow-hidden mb-8">
            <div className="bg-[#5b21b6] text-white px-4 py-2 text-sm font-bold">Goods Details</div>
            <div className="p-4 text-sm space-y-4">
              <div><span className="font-medium text-gray-600">Description:</span> <span className="ml-2">{d.description || "N/A"}</span></div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Packages</div>
                  <div className="font-semibold">{d.packages || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Weight</div>
                  <div className="font-semibold">{d.weight || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Declared Value</div>
                  <div className="font-semibold">₹{fmtAmt(d.declaredValue)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Private Marks</div>
                  <div className="font-semibold">{d.privateMarks || "N/A"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Delivery Type</div>
                  <div className="font-semibold">{d.deliveryType || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Terms</div>
                  <div className="font-semibold">{d.paymentTerms || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charges */}
          <div className="border border-gray-200 rounded overflow-hidden mb-8">
            <div className="bg-[#5b21b6] text-white px-4 py-2 text-sm font-bold">Charges Breakdown</div>
            <div className="p-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-600">Freight</span> <span>₹{fmtAmt(d.freight)}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-600">LR Charges</span> <span>₹{fmtAmt(d.lrCharges)}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-600">Loading</span> <span>₹{fmtAmt(d.loadingCharge)}</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-600">Unloading</span> <span>₹{fmtAmt(d.unloadingCharge)}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-600">Other</span> <span>₹{fmtAmt(d.otherCharge)}</span></div>
                  <div className="flex justify-between border-t-2 border-gray-300 pt-3 text-base">
                    <span className="font-bold">Total Charges</span> 
                    <span className="font-bold">₹{fmtAmt(d.totalCharges)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {d.notes && (
            <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200 text-sm italic text-gray-600">
              <span className="font-bold not-italic text-gray-800">Notes:</span> {d.notes}
            </div>
          )}

          {/* Signature & Stamp */}
          <div className="flex justify-end mt-8 mb-4">
            <div className="text-center w-64">
              <p className="font-bold text-sm mb-2">For {companyName}</p>
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
              <li>Payment will be in the favour of {companyName} by Cash/Cheque.</li>
              <li>Thanking you and awaiting for your valued work order to serve you.</li>
            </ol>
          </div>

        </div>
      </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Send Lorry Receipt</h2>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#5b21b6] focus:border-[#5b21b6]"
                placeholder="Enter recipient email"
              />
              <p className="text-xs text-gray-500 mt-2">The lorry receipt PDF will be generated and attached securely.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={emailing}
                className="px-4 py-2 bg-[#5b21b6] text-white rounded-md hover:bg-[#5b21b6]/90 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                {emailing ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
