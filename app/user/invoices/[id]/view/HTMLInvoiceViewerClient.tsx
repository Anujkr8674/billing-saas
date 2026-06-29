"use client";

import { useState } from "react";
import Link from "next/link";
import {  ArrowLeft, Download, FileText, Mail, X, Printer , MoreVertical } from "lucide-react";
import { generateInvoicePDF } from "@/lib/invoice-pdf-generator";
import AlertModal from "@/components/ui/AlertModal";
import { siteAssets } from "@/lib/site-assets";
import { sendInvoiceEmail } from "@/app/actions/email";

export default function HTMLInvoiceViewerClient({ invoice, profile }: { invoice: any, profile: any }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(invoice?.details?.email || "");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: "success" | "error"}>({
    isOpen: false, title: "", message: "", type: "success"
  });

  // Ensure document title is set for printing headers/footers
  if (typeof document !== "undefined") {
    document.title = `Invoice Document - ${invoice?.docNumber || 'New'}`;
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const uri = await generateInvoicePDF(invoice, profile);
      const a = document.createElement("a");
      a.href = uri;
      a.download = `Invoice_${invoice?.docNumber || "Doc"}.pdf`;
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
      await sendInvoiceEmail(invoice, profile, emailInput);
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

  const d = invoice?.details || {};
  const calc = d.calculations || {};
  const isIgst = calc.igst > 0 || (calc.cgst === 0 && calc.sgst === 0 && d.gstRate === "IGST");

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20 print:block print:overflow-visible print:bg-white print:h-auto">
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 sm:py-3 px-3 sm:px-4 rounded-xl shadow-sm border border-[#5b21b6]/20 mb-6 shrink-0 print:hidden overflow-x-auto">
        <div>
          <h1 className="text-sm sm:text-2xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2 truncate whitespace-nowrap">
            <FileText className="w-6 h-6 text-primary" /> Invoice — Overview
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 print:hidden shrink-0">
          <Link href="/user/invoices" className="text-primary hover:underline flex items-center gap-1 sm:gap-2 font-medium text-sm mr-2 sm:mr-4">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Invoices</span><span className="sm:hidden">Back</span></Link>
          
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

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 relative print:block print:overflow-visible print:h-auto">
        <div className="min-w-[800px] md:min-w-0 max-w-5xl mx-auto bg-white shadow-xl rounded-sm border border-gray-200 relative overflow-hidden print:overflow-visible print:h-auto print:border-none print:shadow-none min-h-[1122px] print:!min-h-0">
          
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
            <div className="flex justify-between items-start">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-48 h-auto object-contain" />
              ) : (
                <div className="w-48 h-20 bg-gray-100 flex items-center justify-center text-gray-400">Logo</div>
              )}
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

                  <div>
                    <p>Phone: {pData.mobileNumber || profile?.mobile || "N/A"}</p>
                    <p>Email: {pData.email || profile?.email || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-[#5b21b6] my-6"></div>
            <h3 className="text-xl font-bold text-center tracking-widest text-[#5b21b6]">GST INVOICE</h3>
            <div className="border-t border-[#5b21b6] my-4"></div>

            <div className="grid grid-cols-2 gap-y-4 mb-8">
              <div><span className="font-bold">Customer Name:</span> {d.customerName || "N/A"}</div>
              <div className="text-right"><span className="font-bold">Invoice No:</span> <span className="text-[#5b21b6] font-medium">{invoice?.docNumber}</span></div>

              <div><span className="font-bold">Phone:</span> {d.phone || "N/A"}</div>
              <div className="text-right"><span className="font-bold">Invoice Date:</span> {d.invoiceDate || "N/A"}</div>

              <div><span className="font-bold">Email:</span> {d.email || "N/A"}</div>
              <div className="text-right"><span className="font-bold">Due Date:</span> {d.dueDate || "N/A"}</div>

              <div><span className="font-bold">GSTIN:</span> {d.gstin || "N/A"}</div>
              <div className="text-right"><span className="font-bold">From City:</span> {d.fromCity || "N/A"}</div>

              <div><span className="font-bold">Address:</span> {d.address || "N/A"}</div>
              <div className="text-right"><span className="font-bold">To City:</span> {d.toCity || "N/A"}</div>
            </div>

            <table className="w-full border-collapse border border-gray-300 text-xs mb-8">
              <thead>
                <tr className="bg-[#5b21b6] text-white">
                  <th className="border border-gray-300 p-2 text-center w-8">#</th>
                  <th className="border border-gray-300 p-2 text-left">Description</th>
                  <th className="border border-gray-300 p-2 text-center">HSN/SAC</th>
                  <th className="border border-gray-300 p-2 text-center">Qty</th>
                  <th className="border border-gray-300 p-2 text-right">Rate</th>
                  <th className="border border-gray-300 p-2 text-right">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {(d.items || []).map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
                    <td className="border border-gray-300 p-2">{item.description}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.hsn}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 text-right">{fmtAmt(item.rate)}</td>
                    <td className="border border-gray-300 p-2 text-right font-bold">{fmtAmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
              <div className="w-full md:w-3/5 space-y-4">
                <div className="border border-gray-300 p-4 min-h-[100px]">
                  <p className="text-[#5b21b6] font-bold text-xs mb-2">Terms & Conditions:</p>
                  <p className="text-xs whitespace-pre-wrap">{d.terms}</p>
                </div>
                {d.internalNotes && (
                  <div className="border border-gray-300 p-4 min-h-[80px]">
                    <p className="text-[#5b21b6] font-bold text-xs mb-2">Internal Notes:</p>
                    <p className="text-xs whitespace-pre-wrap">{d.internalNotes}</p>
                  </div>
                )}
              </div>

              <div className="w-full md:w-2/5">
                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <tbody>
                    <tr><td className="border border-gray-300 p-2">Subtotal</td><td className="border border-gray-300 p-2 text-right">{fmtAmt(calc.subtotal)}</td></tr>
                    {!isIgst && calc.cgst > 0 && (
                      <>
                        <tr><td className="border border-gray-300 p-2">CGST ({(Number(d.gstRate)||0)/2}%)</td><td className="border border-gray-300 p-2 text-right">{fmtAmt(calc.cgst)}</td></tr>
                        <tr><td className="border border-gray-300 p-2">SGST ({(Number(d.gstRate)||0)/2}%)</td><td className="border border-gray-300 p-2 text-right">{fmtAmt(calc.sgst)}</td></tr>
                      </>
                    )}
                    {isIgst && calc.igst > 0 && (
                      <tr><td className="border border-gray-300 p-2">IGST ({Number(d.gstRate)||0}%)</td><td className="border border-gray-300 p-2 text-right">{fmtAmt(calc.igst)}</td></tr>
                    )}
                    <tr className="bg-gray-50"><td className="border border-gray-300 p-2 font-bold text-[#5b21b6]">Grand Total</td><td className="border border-gray-300 p-2 text-right font-bold text-[#5b21b6]">{fmtAmt(calc.grandTotal)}</td></tr>
                    <tr><td className="border border-gray-300 p-2">Amount Paid</td><td className="border border-gray-300 p-2 text-right">{fmtAmt(calc.amountPaid)}</td></tr>
                    <tr className="bg-red-50"><td className="border border-gray-300 p-2 font-bold text-red-600">Balance Due</td><td className="border border-gray-300 p-2 text-right font-bold text-red-600">{fmtAmt(calc.balanceDue)}</td></tr>
                  </tbody>
                </table>

                <div className="mt-4">
                  <div className="text-[#5b21b6] font-bold text-xs mb-1">Total Amount In Words</div>
                  <div className="font-bold text-xs">Rupees {fmtAmt(calc.grandTotal)} Only</div>
                </div>
              </div>
            </div>

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

            {/* General T&C Section */}
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

          </div>
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Send Invoice</h2>
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
              <p className="text-xs text-gray-500 mt-2">The invoice PDF will be generated and attached securely.</p>
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
