"use client";

import { useState } from "react";
import Link from "next/link";
import {  ArrowLeft, Download, FileText, Mail, X, Printer , MoreVertical } from "lucide-react";
import { generateQuotationPDF } from "@/lib/pdf-generator";
import AlertModal from "@/components/ui/AlertModal";
import { siteAssets } from "@/lib/site-assets";
import { sendQuotationEmail } from "@/app/actions/email";

export default function HTMLQuotationViewerClient({ quotation, profile }: { quotation: any, profile: any }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(quotation?.email || quotation?.details?.email || "");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, message: string, type: "success" | "error" }>({
    isOpen: false, title: "", message: "", type: "success"
  });

  // Ensure document title is set for printing headers/footers
  if (typeof document !== "undefined") {
    document.title = `Quotation Document - ${quotation?.docNumber || 'New'}`;
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const uri = await generateQuotationPDF(quotation, profile);
      const a = document.createElement("a");
      a.href = uri;
      a.download = `Quotation_${quotation?.docNumber || "Doc"}.pdf`;
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
      await sendQuotationEmail(quotation, profile, emailInput);
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

  const d = quotation?.details || {};
  const calc = d.calculations || {};
  const p = d.payment || {};

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20 print:block print:overflow-visible print:bg-white print:h-auto">
      {/* Top Action Bar */}
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 sm:py-3 px-3 sm:px-4 rounded-xl shadow-sm border border-[#5b21b6]/20 mb-6 shrink-0 print:hidden overflow-x-auto">
        <div>
          <h1 className="text-sm sm:text-2xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2 truncate whitespace-nowrap">
            <FileText className="w-6 h-6 text-primary" /> Quotation — Overview
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 print:hidden shrink-0">
          <Link href="/user/quotations" className="text-primary hover:underline flex items-center gap-1 sm:gap-2 font-medium text-sm mr-2 sm:mr-4">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Quotations</span><span className="sm:hidden">Back</span></Link>
          
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main HTML Document Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 relative print:block print:overflow-visible print:h-auto">
        <div className="min-w-[800px] md:min-w-0 max-w-5xl mx-auto bg-white shadow-xl rounded-sm border border-gray-200 relative overflow-hidden print:border-none print:shadow-none print:overflow-visible print:h-auto min-h-[1122px] print:!min-h-0">

          {false && profile?.hasWatermark !== false && (
            <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-50">
              {false && (
              <div className="text-[5rem] md:text-[7rem] font-bold text-gray-400 opacity-15 -rotate-45 select-none text-center leading-[1.2]">
                NEXTGEN<br />BILLING
              </div>
            )}
            </div>
          )}

          <div className="p-10 md:p-14 text-sm text-black font-sans relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start">
              {/* Logo */}
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-48 h-auto object-contain" />
              ) : (
                <div className="w-48 h-20 bg-gray-100 flex items-center justify-center text-gray-400">Logo</div>
              )}
              {/* Company Details */}
              <div className="text-right">
                <h2 className="text-2xl font-bold text-[#5b21b6]">{compName}</h2>
                <div className="text-gray-700 mt-2 text-sm space-y-1">
                  {pData.addressLine1 && <p>{pData.addressLine1}{pData.addressLine2 ? `, ${pData.addressLine2}` : ""}</p>}
                  {(pData.city || pData.state) && <p>{pData.city ? pData.city + ", " : ""}{pData.state} {pData.pincode ? `- ${pData.pincode}` : ""}</p>}

                  {(pData.gstNumber || pData.panCardNumber) && (
                    <div className="text-xs">
                      {pData.gstNumber && <span>GSTIN: {pData.gstNumber} </span>}
                      {pData.panCardNumber && <span>{pData.gstNumber ? "| " : ""}PAN: {pData.panCardNumber}</span>}
                    </div>
                  )}

                  {(pData.ownerName || pData.companyCode) && (
                    <div className="text-xs">
                      {pData.ownerName && <span>Owner: {pData.ownerName} </span>}
                      {pData.companyCode && <span>{pData.ownerName ? "| " : ""}Code: {pData.companyCode}</span>}
                    </div>
                  )}

                  <div>
                    <p>Phone: {pData.mobileNumber || profile?.mobile || "N/A"}</p>
                    <p>Email: {pData.email || profile?.email || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-[#5b21b6] my-6"></div>

            <h3 className="text-xl font-bold text-center tracking-widest text-[#5b21b6]">QUOTATION</h3>

            <div className="border-t border-[#5b21b6] my-4"></div>

            {/* Client Details Grid */}
            <div className="grid grid-cols-2 gap-y-4 mb-8">
              <div><span className="font-bold">Company Name:</span> {d.companyName || "N/A"} (GSTIN: {d.companyGst || "N/A"})</div>
              <div className="text-right"><span className="font-bold">Quotation No.:</span> <span className="text-[#5b21b6] font-medium break-all text-xs">{quotation?.docNumber || "Auto Generated"}</span></div>

              <div><span className="font-bold">Name:</span> {d.partyName || "N/A"}</div>
              <div className="text-right"><span className="font-bold">Quotation Date:</span> {d.quotationDate || "N/A"}</div>

              <div className="flex gap-10">
                <div><span className="font-bold">Phone:</span> {d.phone || "N/A"}</div>
                <div><span className="font-bold">Email:</span> {d.email || "N/A"}</div>
              </div>
              <div className="text-right"><span className="font-bold">Packing Date:</span> {d.packingDate || "N/A"}</div>

              <div><span className="font-bold">Moving Type:</span> {d.movingType || "N/A"}</div>
              <div className="text-right"><span className="font-bold">Moving Date:</span> {d.movingDate || "N/A"}</div>
            </div>

            {/* Greeting */}
            <div className="mb-8">
              <p className="font-bold mb-2">Dear sir/madam</p>
              <p>We thank you for your valuable enquiry regarding the packing and shifting of your moving items from {d.moveFrom?.city || "your location"} to {d.moveTo?.city || "your destination"}. We are pleased to quote the rates for the same as follows:</p>
            </div>

            {/* Tables Area - Flex container to match jsPDF side-by-side */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">

              {/* Left Column (Move details + Items) */}
              <div className="w-full md:w-3/5 space-y-6">
                {/* Move From / To Table */}
                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-[#5b21b6] text-white">
                      <th className="border border-gray-300 p-2 text-left">Move From</th>
                      <th className="border border-gray-300 p-2 text-left">Move To</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">City: {d.moveFrom?.city || ""}</td>
                      <td className="border border-gray-300 p-2">City: {d.moveTo?.city || ""}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">State: {d.moveFrom?.state || ""} - {d.moveFrom?.pincode || ""}</td>
                      <td className="border border-gray-300 p-2">State: {d.moveTo?.state || ""} - {d.moveTo?.pincode || ""}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Country: {d.moveFrom?.country || ""}</td>
                      <td className="border border-gray-300 p-2">Country: {d.moveTo?.country || ""}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Address: {d.moveFrom?.address || ""}</td>
                      <td className="border border-gray-300 p-2">Address: {d.moveTo?.address || ""}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Floor: {d.moveFrom?.floor || ""}</td>
                      <td className="border border-gray-300 p-2">Floor: {d.moveTo?.floor || ""}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Is Lift Available: {d.moveFrom?.lift || ""}</td>
                      <td className="border border-gray-300 p-2">Is Lift Available: {d.moveTo?.lift || ""}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Items Table */}
                <table className="w-full border-collapse border border-gray-300 text-xs mt-6">
                  <thead>
                    <tr className="bg-[#5b21b6] text-white">
                      <th className="border border-gray-300 p-2 text-center w-8">#</th>
                      <th className="border border-gray-300 p-2 text-left">Item / Particulars</th>
                      <th className="border border-gray-300 p-2 text-center">Qty</th>
                      <th className="border border-gray-300 p-2 text-right">Value (Rs.)</th>
                      <th className="border border-gray-300 p-2 text-left">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(d.items || []).map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
                        <td className="border border-gray-300 p-2">{item.name}</td>
                        <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(item.value)}</td>
                        <td className="border border-gray-300 p-2">{item.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right Column (Particulars) */}
              <div className="w-full md:w-2/5">
                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-[#5b21b6] text-white">
                      <th className="border border-gray-300 p-2 text-left">Particulars</th>
                      <th className="border border-gray-300 p-2 text-right">Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-300 p-2">Freight</td><td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(p.freightCharge)}</td></tr>
                    <tr><td className="border border-gray-300 p-2">Packing Charge</td><td className="border border-gray-300 p-2 text-right font-bold">{p.packingChargeType === "Extra" ? fmtAmt(p.packingChargeAmount) : "Included"}</td></tr>
                    <tr><td className="border border-gray-300 p-2">Un Packing Charge</td><td className="border border-gray-300 p-2 text-right font-bold">{p.unPackingChargeType === "Extra" ? fmtAmt(p.unPackingChargeAmount) : "Included"}</td></tr>
                    <tr><td className="border border-gray-300 p-2">Loading Charge</td><td className="border border-gray-300 p-2 text-right font-bold">{p.loadingChargeType === "Extra" ? fmtAmt(p.loadingChargeAmount) : "Included"}</td></tr>
                    <tr><td className="border border-gray-300 p-2">Un Loading Charge</td><td className="border border-gray-300 p-2 text-right font-bold">{p.unLoadingChargeType === "Extra" ? fmtAmt(p.unLoadingChargeAmount) : "Included"}</td></tr>
                    <tr><td className="border border-gray-300 p-2">Pack. Material Charge</td><td className="border border-gray-300 p-2 text-right font-bold">{p.packingMaterialType === "Extra" ? fmtAmt(p.packingMaterialAmount) : "Included"}</td></tr>
                    <tr><td className="border border-gray-300 p-2">Storage Charge</td><td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(p.storageCharge)}</td></tr>
                    <tr><td className="border border-gray-300 p-2">Car/Bike TPT</td><td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(p.carTransportCharge)}</td></tr>
                    <tr><td className="border border-gray-300 p-2">Miscellaneous Charge</td><td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(p.miscCharge)}</td></tr>
                    <tr><td className="border border-gray-300 p-2">Other Charge</td><td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(p.otherCharge)}</td></tr>

                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 p-2 font-bold">Sub Total</td>
                      <td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(calc.subTotal)}</td>
                    </tr>

                    {p.gstType === "CGST/SGST" ? (
                      <>
                        <tr><td className="border border-gray-300 p-2">SGST ({(Number(p.gstPercent) || 18) / 2}%)</td><td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(calc.sgst)}</td></tr>
                        <tr><td className="border border-gray-300 p-2">CGST ({(Number(p.gstPercent) || 18) / 2}%)</td><td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(calc.cgst)}</td></tr>
                      </>
                    ) : (
                      <tr><td className="border border-gray-300 p-2">IGST ({Number(p.gstPercent) || 18}%)</td><td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(calc.igst)}</td></tr>
                    )}
                    <tr><td className="border border-gray-300 p-2">Insurance Charge</td><td className="border border-gray-300 p-2 text-right font-bold">{p.insuranceType === "Optional" ? "Included" : "N/A"}</td></tr>
                  </tbody>
                </table>

                {/* Total Row */}
                <div className="bg-[#5b21b6] text-white p-3 font-bold flex justify-between mt-2 rounded-sm text-sm">
                  <span>Total Amount</span>
                  <span>{fmtAmt(calc.grandTotal)}</span>
                </div>

                {/* Words */}
                <table className="w-full border-collapse border border-gray-300 text-xs mt-4">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">
                        <div className="text-[#5b21b6] font-bold mb-2">Total Amount In Words</div>
                        <div className="font-bold">Rupees {fmtAmt(calc.grandTotal)} Only</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* QnA Table */}
            <table className="w-full border-collapse border border-gray-300 text-xs mb-8">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 w-3/4">Is there easy access for loading & unloading at Location Move From & Move To:</td>
                  <td className="border border-gray-300 p-2 font-bold text-center">Yes</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 w-3/4">Should any items be got down through balcony etc.:</td>
                  <td className="border border-gray-300 p-2 font-bold text-center">N/A</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 w-3/4">Are there any restrictions for loading/unloading at Location Move From/Move To:</td>
                  <td className="border border-gray-300 p-2 font-bold text-center">N/A</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 w-3/4">Does you have any special needs or concerns:</td>
                  <td className="border border-gray-300 p-2 font-bold text-center">N/A</td>
                </tr>
              </tbody>
            </table>

            {/* Remarks */}
            <div className="text-xs mb-10">
              <p className="font-bold mb-1">Insurance charge @{p.insurancePercent || 1}% on declaration value of goods</p>
              <p><span className="font-bold">Remark:</span> {p.remark || "N/A"}</p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end mb-10">
              <div className="text-center">
                <p className="text-[#5b21b6] font-bold text-lg">{compName}</p>
                <p className="font-bold mt-12 text-sm">Authorized Signatory</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-xs mb-8">I Agree with Terms & Conditions as</p>
                <div className="border-t border-gray-400 w-64 inline-block"></div>
                <p className="text-xs mt-2 text-center text-gray-700">Overleaf Signature Receiver's</p>
              </div>
            </div>

            {/* Bank Detail */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-300 p-4">
                <p className="text-[#5b21b6] font-bold text-xs mb-2">Bank Detail:</p>
                <div className="text-xs space-y-1 font-bold">
                  <p>Beneficiary Name : <span className="font-normal">{compName}</span></p>
                  <p>Bank Name : <span className="font-normal"></span></p>
                  <p>Bank A/C No. : <span className="font-normal"></span></p>
                  <p>Bank IFSC Code : <span className="font-normal"></span></p>
                </div>
              </div>
              <div className="border border-gray-300 p-4">
                <p className="text-[#5b21b6] font-bold text-xs mb-2">Other Payment Options:</p>
                <div className="text-xs space-y-1 font-bold">
                  <p>PhonePe/Google Pay : <span className="font-normal">{pData.mobileNumber || profile?.mobile || ""}</span></p>
                  <p>Cash / Cheque <span className="font-normal">in favour of {compName}</span></p>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="border border-[#5b21b6] p-4 text-xs font-bold mb-10 bg-[#5b21b6]/10">
              <p className="text-[#5b21b6] mb-2">Note:</p>
              <p>Please keep your Cash/Jewelery and all important documents in your Custody/Lock carrying<br />
                Liquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil, etc.) is totally prohibited.</p>
            </div>

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
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Send Quotation</h2>
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
              <p className="text-xs text-gray-500 mt-2">The quotation PDF will be generated and attached securely.</p>
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
