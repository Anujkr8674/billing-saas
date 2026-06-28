"use client";

import { useState } from "react";
import { Download, Mail, ArrowLeft, Printer, X, Edit, FileText } from "lucide-react";
import Link from "next/link";
import { siteAssets } from "@/lib/site-assets";
import { useAlert } from "@/components/providers/AlertModalProvider";

export default function HTMLPackingListViewerClient({ packingList, userProfile }: { packingList: any, userProfile: any }) {
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(packingList.details?.email || "");
  const { showAlert } = useAlert();

  const pData = userProfile?.profile || {};
  const d = packingList.details || {};
  
  const hasWatermark = userProfile?.hasWatermark ?? true;
  const companyName = pData.companyName || "COMPANY NAME PVT. LTD.";
  const logoUrl = (pData.companyLogo && pData.companyLogo.startsWith('http')) 
    ? pData.companyLogo 
    : siteAssets.logo;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { generatePackingListPDF } = await import("@/lib/packinglist-pdf-generator");
      const pdfBlob = await generatePackingListPDF(packingList, userProfile);
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `PackingList_${packingList.docNumber}.pdf`;
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
    setEmailInput(d.email || "");
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailInput) return;
    setEmailing(true);
    try {
      const { sendPackingListEmail } = await import("@/app/actions/email");
      await sendPackingListEmail(packingList, userProfile, emailInput);
      showAlert("success", "Packing List emailed successfully!");
      setIsEmailModalOpen(false);
    } catch (err: any) {
      showAlert("error", err.message || "Failed to send email");
    }
    setEmailing(false);
  };

  const fmtAmt = (amt: any) => Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20 print:block print:overflow-visible print:bg-white print:h-auto">
      <div className="flex items-center justify-between mb-4 shrink-0 px-2 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#5b21b6]" /> View Packing List
          </h1>
        </div>
        <div className="flex flex-nowrap whitespace-nowrap items-center gap-4 print:hidden overflow-x-auto custom-scrollbar pb-1">
          <Link href="/user/packing-lists" className="text-[#5b21b6] hover:underline flex items-center gap-2 font-medium text-sm mr-4">
            <ArrowLeft className="w-4 h-4" /> Back to Packing Lists
          </Link>
          <Link 
            href={`/user/packing-lists/${packingList.id}`}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Edit className="w-4 h-4" /> Edit
          </Link>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button 
            onClick={handleEmailClick}
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
      </div>

      {/* HTML Document View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 relative print:block print:overflow-visible print:h-auto px-4 lg:px-0">
        <div className="max-w-5xl mx-auto bg-white text-black p-8 rounded-xl shadow-lg border border-gray-200 min-h-[1056px] relative overflow-hidden print:shadow-none print:border-none print:p-0">
        
        {/* Watermark overlay */}
        {hasWatermark && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden" style={{ zIndex: 0 }}>
            <div className="text-[120px] font-bold text-gray-200/40 -rotate-45 select-none flex flex-col items-center leading-none">
              <span>NEXTGEN</span>
              <span>BILLING</span>
            </div>
          </div>
        )}

        <div className="relative z-10">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-[#5b21b6] pb-6">
            <div>
              {logoUrl && <img src={logoUrl} alt="Company Logo" className="h-16 object-contain mb-4" />}
            </div>
            <div className="text-right max-w-sm">
              <h1 className="text-2xl font-bold text-[#5b21b6] uppercase tracking-wide">{companyName}</h1>
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

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#5b21b6] inline-block px-6 py-2 border border-gray-200 rounded bg-gray-50">Packing List</h2>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Customer Details */}
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-bold text-sm text-[#5b21b6] uppercase mb-3 border-b border-gray-100 pb-2">Customer Details</h3>
              <div className="text-sm space-y-1">
                <p className="font-bold text-base">{d.customerName || packingList.clientName || "N/A"}</p>
                {d.phone && <p className="text-gray-600"><span className="font-medium text-gray-800">Phone:</span> {d.phone}</p>}
                {d.email && <p className="text-gray-600"><span className="font-medium text-gray-800">Email:</span> {d.email}</p>}
                {d.address && <p className="text-gray-600 mt-2">{d.address}</p>}
              </div>
            </div>
            
            {/* Shifting Details */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="bg-[#5b21b6] text-white px-4 py-2 text-sm font-bold">Shifting Details</div>
              <div className="p-4 text-sm space-y-2">
                <div className="flex"><span className="w-32 font-medium text-gray-600">Doc No:</span> <span className="font-semibold">{packingList.docNumber}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">Packing Date:</span> <span>{packingList.date ? new Date(packingList.date).toLocaleDateString("en-IN") : "N/A"}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">Shifting Date:</span> <span>{d.shiftingDate ? new Date(d.shiftingDate).toLocaleDateString("en-IN") : "N/A"}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">From &rarr; To:</span> <span>{d.fromCity || "N/A"} &rarr; {d.toCity || "N/A"}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">Vehicle No:</span> <span>{d.vehicleNo || "N/A"}</span></div>
                <div className="flex"><span className="w-32 font-medium text-gray-600">Packed By:</span> <span>{d.packedBy || "N/A"}</span></div>
              </div>
            </div>
          </div>

          {/* Packing Items */}
          <div className="mb-8">
            <h3 className="font-bold text-sm text-[#5b21b6] uppercase mb-3">Packing Items</h3>
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-[#5b21b6] text-white">
                  <th className="py-2 px-3 border border-gray-300 font-semibold text-xs text-center w-10">#</th>
                  <th className="py-2 px-3 border border-gray-300 font-semibold text-xs">Item Name</th>
                  <th className="py-2 px-3 border border-gray-300 font-semibold text-xs text-center w-24">Box No.</th>
                  <th className="py-2 px-3 border border-gray-300 font-semibold text-xs text-center w-20">Quantity</th>
                  <th className="py-2 px-3 border border-gray-300 font-semibold text-xs text-right w-28">Value (Rs.)</th>
                  <th className="py-2 px-3 border border-gray-300 font-semibold text-xs text-center w-20">CFT</th>
                  <th className="py-2 px-3 border border-gray-300 font-semibold text-xs">Remark</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(d.items || []).map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-2 px-3 border border-gray-200 text-center">{idx + 1}</td>
                    <td className="py-2 px-3 border border-gray-200">{item.name || "-"}</td>
                    <td className="py-2 px-3 border border-gray-200 text-center">{item.boxNumber || "-"}</td>
                    <td className="py-2 px-3 border border-gray-200 text-center">{item.quantity || "1"}</td>
                    <td className="py-2 px-3 border border-gray-200 text-right">{item.value ? fmtAmt(item.value) : "-"}</td>
                    <td className="py-2 px-3 border border-gray-200 text-center">{item.cft || "-"}</td>
                    <td className="py-2 px-3 border border-gray-200">{item.remark || "-"}</td>
                  </tr>
                ))}
                {(!d.items || d.items.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500 text-sm">No items added</td>
                  </tr>
                )}
                <tr className="bg-gray-50 font-bold text-[#5b21b6]">
                  <td colSpan={3} className="py-2 px-3 border border-gray-200 text-right">TOTAL</td>
                  <td className="py-2 px-3 border border-gray-200 text-center">
                    {(d.items || []).reduce((acc: number, curr: any) => acc + (Number(curr.quantity) || 0), 0)}
                  </td>
                  <td colSpan={3} className="py-2 px-3 border border-gray-200"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {d.notes && (
            <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200 text-sm italic text-gray-600">
              <span className="font-bold not-italic text-gray-800">Notes:</span> {d.notes}
            </div>
          )}

          {/* Terms */}
          {pData.termsConditions && (
            <div className="mt-8 mb-12">
              <h4 className="text-sm font-bold mb-2">Terms & Conditions:</h4>
              <p className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
                {pData.termsConditions}
              </p>
            </div>
          )}

          {/* Footer Signatures */}
          <div className="mt-20 pt-8 border-t border-gray-200 flex justify-between items-end">
            <div className="text-center">
              <div className="w-48 border-b border-gray-400 mb-2"></div>
              <p className="text-sm font-bold text-gray-600">Customer's Signature</p>
            </div>
            
            <div className="text-center w-64">
              <p className="text-sm font-bold mb-2">For {companyName}</p>
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
              <li>Payment will be in the favour of {companyName} by Cash/Cheque.</li>
              <li>All disputes are subject to Ranchi Jurisdiction.</li>
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
              <h2 className="text-lg font-bold text-gray-800">Send Packing List</h2>
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
              <p className="text-xs text-gray-500 mt-2">The packing list PDF will be generated and attached securely.</p>
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
