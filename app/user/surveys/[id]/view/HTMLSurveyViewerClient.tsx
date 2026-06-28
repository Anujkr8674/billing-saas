"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Mail, X, Printer } from "lucide-react";
import { generateSurveyPDF } from "@/lib/survey-pdf-generator";
import AlertModal from "@/components/ui/AlertModal";
import { siteAssets } from "@/lib/site-assets";
import { sendSurveyEmail } from "@/app/actions/email";

export default function HTMLSurveyViewerClient({ survey, profile }: { survey: any, profile: any }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(survey?.details?.email || "");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: "success" | "error"}>({
    isOpen: false, title: "", message: "", type: "success"
  });

  useEffect(() => {
    document.title = `Survey Document - ${survey?.docNumber || 'New'}`;
  }, [survey]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const uri = await generateSurveyPDF(survey, profile);
      const a = document.createElement("a");
      a.href = uri;
      a.download = `Survey_${survey?.docNumber || "Doc"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("PDF gen error", err);
    }
    setIsDownloading(false);
  };

  const handleSendEmail = async () => {
    if (!emailInput) {
      setAlertConfig({ isOpen: true, title: "Missing Information", message: "Please enter an email address", type: "error" });
      return;
    }
    setIsSendingEmail(true);
    try {
      await sendSurveyEmail(survey, profile, emailInput);
      setAlertConfig({ isOpen: true, title: "Success", message: "Email sent successfully!", type: "success" });
      setIsEmailModalOpen(false);
    } catch (err: any) {
      setAlertConfig({ isOpen: true, title: "Error", message: err.message || "Failed to send email.", type: "error" });
    }
    setIsSendingEmail(false);
  };

  const fmtAmt = (num: number) => Number(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pData = profile?.profile || {};
  const compName = pData.companyName || "COMPANY NAME PVT. LTD.";
  const logoUrl = (profile?.companyLogo && profile.companyLogo.startsWith('http')) ? profile.companyLogo : siteAssets.logo;

  const d = survey?.details || {};

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20 print:block print:overflow-visible print:bg-white print:h-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0 px-2 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Survey — Overview
          </h1>
        </div>
        <div className="flex flex-nowrap whitespace-nowrap items-center gap-4 print:hidden overflow-x-auto custom-scrollbar pb-1">
          <Link href="/user/surveys" className="text-primary hover:underline flex items-center gap-2 font-medium text-sm mr-4">
            <ArrowLeft className="w-4 h-4" /> Back to Surveys
          </Link>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button 
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-[#1e40af] text-[#1e40af] font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-sm"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2 bg-[#1e40af] text-white font-medium rounded-lg hover:bg-[#1e40af]/90 transition-colors shadow-sm disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" /> {isDownloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Main HTML Document Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 relative print:block print:overflow-visible print:h-auto">
        <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-sm border border-gray-200 relative overflow-hidden print:overflow-visible print:h-auto print:border-none print:shadow-none min-h-[1122px] print:!min-h-0">
          
          {profile?.hasWatermark !== false && (
            <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-50">
              <div className="text-[5rem] md:text-[7rem] font-bold text-gray-400 opacity-15 -rotate-45 select-none text-center leading-[1.2]">
                NEXTGEN<br />BILLING
              </div>
            </div>
          )}

          <div className="p-10 md:p-14 text-sm text-black font-sans relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start">
              {/* Logo */}
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-48 h-auto object-contain" />
              ) : (
                <div className="w-48 h-16 bg-gray-100 flex items-center justify-center text-gray-400 italic">Logo Placeholder</div>
              )}
              
              {/* Company Info */}
              <div className="text-right">
                <h2 className="text-2xl font-bold text-[#5b21b6] uppercase tracking-wide">{compName}</h2>
                <div className="text-gray-700 mt-2 space-y-1 text-sm">
                  {pData.addressLine1 && <p>{pData.addressLine1}{pData.addressLine2 ? `, ${pData.addressLine2}` : ""}</p>}
                  {(pData.city || pData.state) && <p>{pData.city ? pData.city + ", " : ""}{pData.state || ""} {pData.pincode ? "- " + pData.pincode : ""}</p>}
                  {(pData.gstNumber || pData.panCardNumber) && (
                    <p className="font-medium text-gray-800">
                      {pData.gstNumber ? `GSTIN: ${pData.gstNumber}` : ""}
                      {pData.gstNumber && pData.panCardNumber ? " | " : ""}
                      {pData.panCardNumber ? `PAN: ${pData.panCardNumber}` : ""}
                    </p>
                  )}
                  {(pData.ownerName || pData.companyCode) && (
                    <p>
                      {pData.ownerName ? `Owner: ${pData.ownerName}` : ""}
                      {pData.ownerName && pData.companyCode ? " | " : ""}
                      {pData.companyCode ? `Code: ${pData.companyCode}` : ""}
                    </p>
                  )}
                  <p>Phone: {pData.mobileNumber || profile?.mobile || "N/A"}</p>
                  <p>Email: {pData.email || profile?.email || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="w-full h-[2px] bg-[#5b21b6] my-6"></div>

            <h3 className="text-center text-xl font-bold text-[#5b21b6] tracking-[0.2em] mb-6">SURVEY DOCUMENT</h3>

            <div className="w-full h-[1px] bg-gray-300 mb-8"></div>

            {/* Customer & Survey Details Container */}
            <div className="space-y-6">
              
              {/* Customer Details Block */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-[#5b21b6] text-white font-bold px-4 py-2">Customer Details</div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm bg-gray-50">
                  <div><span className="font-semibold text-gray-600">Name:</span> {d.customerName || "N/A"}</div>
                  <div><span className="font-semibold text-gray-600">Phone:</span> {d.phone || "N/A"}</div>
                  <div><span className="font-semibold text-gray-600">Email:</span> {d.email || "N/A"}</div>
                  <div><span className="font-semibold text-gray-600">Address:</span> {d.address || "N/A"}</div>
                </div>
              </div>

              {/* Survey Details Block */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-[#5b21b6] text-white font-bold px-4 py-2">Survey Details</div>
                <div className="p-4 bg-gray-50 flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="font-semibold text-gray-600">Survey Date:</span> {d.surveyDate || "N/A"}</div>
                    <div><span className="font-semibold text-gray-600">Shifting Date:</span> {d.shiftingDate || "N/A"}</div>
                    <div><span className="font-semibold text-gray-600">Surveyor Name:</span> {d.surveyorName || "N/A"}</div>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-600">Vehicle No:</span> {d.vehicleNo || "N/A"}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div>
                      <div className="font-semibold text-gray-600 mb-1">From Address:</div>
                      <div className="bg-white p-2 border border-gray-200 rounded text-gray-700 min-h-[3rem] whitespace-pre-wrap">{d.fromAddress || "N/A"}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-600 mb-1">To Address:</div>
                      <div className="bg-white p-2 border border-gray-200 rounded text-gray-700 min-h-[3rem] whitespace-pre-wrap">{d.toAddress || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Items Table */}
            <div className="mt-8 border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#5b21b6] text-white">
                    <th className="p-3 font-bold border-b border-gray-300 w-12 text-center">#</th>
                    <th className="p-3 font-bold border-b border-gray-300">Item / Particulars Name</th>
                    <th className="p-3 font-bold border-b border-gray-300 text-right w-28">Rate / Item</th>
                    <th className="p-3 font-bold border-b border-gray-300 text-center w-20">Qty</th>
                    <th className="p-3 font-bold border-b border-gray-300 text-right w-32">Value (Rs.)</th>
                    <th className="p-3 font-bold border-b border-gray-300 text-center w-24">CFT</th>
                    <th className="p-3 font-bold border-b border-gray-300 text-center w-32">Condition</th>
                    <th className="p-3 font-bold border-b border-gray-300">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(d.items || []).map((item: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-transparent" : "bg-gray-50/50"}>
                      <td className="p-3 border-r border-gray-200 text-center">{i + 1}</td>
                      <td className="p-3 border-r border-gray-200">{item.name}</td>
                      <td className="p-3 border-r border-gray-200 text-right">{fmtAmt(item.rate)}</td>
                      <td className="p-3 border-r border-gray-200 text-center">{item.quantity}</td>
                      <td className="p-3 border-r border-gray-200 text-right font-medium">{fmtAmt(item.value)}</td>
                      <td className="p-3 border-r border-gray-200 text-center">{item.cft}</td>
                      <td className="p-3 border-r border-gray-200 text-center">{item.condition}</td>
                      <td className="p-3">{item.remark}</td>
                    </tr>
                  ))}
                  {(!d.items || d.items.length === 0) && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-gray-500 italic">No items added to this survey.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Notes Section */}
            {d.notes && (
              <div className="mt-8 border border-gray-300 rounded overflow-hidden">
                <div className="bg-gray-100/80 text-gray-800 font-bold px-4 py-2 border-b border-gray-300">Notes</div>
                <div className="p-4 text-gray-700 whitespace-pre-wrap">{d.notes}</div>
              </div>
            )}

            {/* Signature & Stamp */}
            <div className="flex justify-end mt-8 mb-4">
              <div className="text-center w-64">
                <p className="font-bold text-sm mb-2">For {compName}</p>
                <div className="flex flex-col items-center justify-center min-h-16 mb-2">
                  {(profile?.companyStamp || pData?.companyStamp) && (
                    <img src={profile?.companyStamp || pData?.companyStamp} alt="Stamp" className="max-h-20 max-w-24" />
                  )}
                  {(profile?.authorizedSignature || pData?.authorizedSignature) && (
                    <img src={profile?.authorizedSignature || pData?.authorizedSignature} alt="Signature" className="max-h-16 max-w-48" />
                  )}
                  {!(profile?.companyStamp || pData?.companyStamp) && !(profile?.authorizedSignature || pData?.authorizedSignature) && (
                    <div className="h-10 w-full border-b border-dashed border-gray-300"></div>
                  )}
                </div>
                <p className="text-xs font-bold text-gray-600">Authorized Signatory</p>
              </div>
            </div>

            {/* T&C Section */}
            <div className="mt-8">
              <div className="text-xs text-center text-gray-500 font-bold bg-gray-100 py-3 mb-6">
                This is a computer-generated document. SAVE PAPER - SAVE TREES | BE DIGITAL - GO GREEN
              </div>

              <div className="text-sm text-center text-white font-bold bg-[#5b21b6] py-3 mb-8 rounded-sm">
                For Any Query contact us: Mob.: {pData.mobileNumber || profile?.mobile || ""}
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

            <div className="mt-20"></div>

          </div>
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Send Survey</h2>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1e40af] focus:border-[#1e40af]"
                placeholder="Enter recipient email"
              />
              <p className="text-xs text-gray-500 mt-2">The survey PDF will be generated and attached securely.</p>
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
                disabled={isSendingEmail}
                className="px-4 py-2 bg-[#1e40af] text-white rounded-md hover:bg-[#1e40af]/90 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                {isSendingEmail ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={alertConfig.isOpen} 
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} 
        title={alertConfig.title} 
        message={alertConfig.message} 
        type={alertConfig.type} 
      />

    </div>
  );
}
