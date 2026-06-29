"use client";
import { useState, useRef, useEffect } from "react";
import { generateVehicleConditionPDF } from "@/lib/vehiclecondition-pdf-generator";
import { sendVehicleConditionEmail } from "@/app/actions/email"; 
import { siteAssets } from "@/lib/site-assets";
import {  Download, Edit, Printer, Mail, X, Send , MoreVertical } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAlert } from "@/components/providers/AlertModalProvider";
import { FileText, ArrowLeft } from "lucide-react";

export default function VehicleConditionViewerClient({ doc, userProfile }: { doc: any; userProfile: any }) {
  const [downloading, setDownloading] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(doc.details?.email || "");
  const [sendingEmail, setSendingEmail] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useAlert();
  
  const searchParams = useSearchParams();
  const shouldSendEmail = searchParams.get("sendEmail") === "true";

  useEffect(() => {
    if (shouldSendEmail) {
      setIsEmailModalOpen(true);
      if (doc.details?.email) {
        setRecipientEmail(doc.details.email);
      }
    }
  }, [shouldSendEmail, doc]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const pdfBlobBase64 = await generateVehicleConditionPDF(doc, userProfile);
      const link = document.createElement("a");
      link.href = pdfBlobBase64;
      link.download = `VehicleCondition_${doc.docNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("PDF generation failed", error);
      showAlert("error", "Failed to download PDF");
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
      await sendVehicleConditionEmail(doc, userProfile, recipientEmail);
      showAlert("success", "Email sent successfully!");
      setIsEmailModalOpen(false);
    } catch (error: any) {
      showAlert("error", error.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const d = doc.details || {};
  const pData = userProfile?.profile || {};

  const logoUrl = (pData.companyLogo && pData.companyLogo.startsWith('http')) 
    ? pData.companyLogo 
    : siteAssets.logo;

  const renderYesNo = (val: string) => val === "yes" ? "YES" : "NO";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20 print:block print:overflow-visible print:bg-white print:h-auto">
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 sm:py-3 px-3 sm:px-4 rounded-xl shadow-sm border border-[#5b21b6]/20 mb-6 shrink-0 print:hidden overflow-x-auto">
        <div>
          <h1 className="text-sm sm:text-2xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2 truncate whitespace-nowrap">
            <FileText className="w-4 h-4 sm:w-6 sm:h-6 shrink-0 text-[#5b21b6]" /> View Vehicle Condition
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 print:hidden shrink-0">
          <Link href="/user/vehicle-conditions" className="text-[#5b21b6] hover:underline flex items-center gap-1 sm:gap-2 font-medium text-sm mr-2 sm:mr-4">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Vehicle Conditions</span><span className="sm:hidden">Back</span></Link>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* HTML Document View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 relative print:block print:overflow-visible print:h-auto px-4 lg:px-0">
        <div 
          ref={printRef}
          className="min-w-[800px] md:min-w-0 max-w-5xl mx-auto bg-white text-black p-8 sm:p-12 min-h-[1056px] shadow-lg print:shadow-none print:border-none print:p-0 border border-gray-200 relative overflow-hidden"
        >
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

          {/* Title */}
          <div className="bg-[#5b21b6] text-white py-2 px-6 rounded-md inline-block mx-auto mb-10 text-center shadow-sm w-full">
            <h2 className="text-lg font-bold tracking-widest uppercase">VEHICLE CONDITION REPORT</h2>
          </div>

          {/* Condition Details Table */}
          <div className="mb-6 rounded-lg overflow-hidden border border-[#e9d5ff]">
            <div className="bg-[#f3e8ff] px-4 py-2 border-b border-[#e9d5ff]">
              <h3 className="font-bold text-[#5b21b6] text-sm uppercase">Condition Details</h3>
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="w-1/4 py-2 px-4 bg-gray-50 font-semibold text-gray-800">Document No</td>
                  <td className="w-1/4 py-2 px-4">{doc.docNumber || "N/A"}</td>
                  <td className="w-1/4 py-2 px-4 bg-gray-50 font-semibold text-gray-800">LR Number</td>
                  <td className="w-1/4 py-2 px-4">{d.lrNumber || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Party Name</td>
                  <td className="py-2 px-4">{d.partyName || "N/A"}</td>
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Date</td>
                  <td className="py-2 px-4" suppressHydrationWarning>{new Date(doc.date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Move From</td>
                  <td className="py-2 px-4">{d.moveFromAddress || "N/A"}</td>
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Move To</td>
                  <td className="py-2 px-4">{d.moveToAddress || "N/A"}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Phone</td>
                  <td className="py-2 px-4">{d.phone || "N/A"}</td>
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Email</td>
                  <td className="py-2 px-4">{d.email || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Vehicle Information Table */}
          <div className="mb-6 rounded-lg overflow-hidden border border-[#e9d5ff]">
            <div className="bg-[#f3e8ff] px-4 py-2 border-b border-[#e9d5ff]">
              <h3 className="font-bold text-[#5b21b6] text-sm uppercase">Vehicle Information</h3>
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="w-1/4 py-2 px-4 bg-gray-50 font-semibold text-gray-800">Vehicle Type</td>
                  <td className="w-1/4 py-2 px-4">{d.vehicleType || "N/A"}</td>
                  <td className="w-1/4 py-2 px-4 bg-gray-50 font-semibold text-gray-800">Vehicle Reg. No.</td>
                  <td className="w-1/4 py-2 px-4">{d.vehicleRegNo || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Brand Name</td>
                  <td className="py-2 px-4">{d.vehicleBrandName || "N/A"}</td>
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Mfg. Year</td>
                  <td className="py-2 px-4">{d.manufacturingYear || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Vehicle Value</td>
                  <td className="py-2 px-4">{d.vehicleValue ? `Rs. ${d.vehicleValue}` : "N/A"}</td>
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Colour</td>
                  <td className="py-2 px-4">{d.colour || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Ins. Policy No.</td>
                  <td className="py-2 px-4">{d.insurancePolicyNo || "N/A"}</td>
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Kilometers</td>
                  <td className="py-2 px-4">{d.vehicleKilometer || "N/A"}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Ins. Company</td>
                  <td className="py-2 px-4">{d.insuranceCompanyName || "N/A"}</td>
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Chassis & Engine</td>
                  <td className="py-2 px-4">{d.chassisNo || "N/A"} / {d.engineNo || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Accessories Details Table */}
          <div className="mb-6 rounded-lg overflow-hidden border border-[#e9d5ff]">
            <div className="bg-[#f3e8ff] px-4 py-2 border-b border-[#e9d5ff]">
              <h3 className="font-bold text-[#5b21b6] text-sm uppercase">Accessories Details</h3>
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="w-1/4 py-1.5 px-4 bg-gray-50 text-gray-800">Stepney</td>
                  <td className="w-1/4 py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.stepney)}</td>
                  <td className="w-1/4 py-1.5 px-4 bg-gray-50 text-gray-800">Digital Watch</td>
                  <td className="w-1/4 py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.digitalWatch)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Wheel Caps</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.wheelCaps)}</td>
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Speaker</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.speaker)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Side Rear View Mirror</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.sideRearViewMirror)}</td>
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Tool Kit</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.toolKit)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Car Radio/Player</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.carRadioPlayer)}</td>
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Jack</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.jack)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Air Condition</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.airCondition)}</td>
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Wiper Arms & Blades</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.wiperArmsBlades)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Lighter</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.lighter)}</td>
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Mud Flap</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.mudFlap)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Floor Rubber Carpet</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.floorRubberCarpet)}</td>
                  <td className="py-1.5 px-4 bg-gray-50 text-gray-800">Fuel (Petrol/Ltr)</td>
                  <td className="py-1.5 px-4 font-semibold text-center">{renderYesNo(d.accessories?.fuel)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dents, Scratches & Other */}
          <div className="mb-8 rounded-lg overflow-hidden border border-[#e9d5ff]">
            <div className="bg-[#f3e8ff] px-4 py-2 border-b border-[#e9d5ff]">
              <h3 className="font-bold text-[#5b21b6] text-sm uppercase">Dent / Scratches & Remarks</h3>
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="w-1/4 py-2 px-4 bg-gray-50 font-semibold text-gray-800">Battery No.</td>
                  <td className="w-3/4 py-2 px-4">{d.batteryNo || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Tyre No.</td>
                  <td className="py-2 px-4">{d.tyreNo || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Other Accessories</td>
                  <td className="py-2 px-4">{d.otherAccessories || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Scratches</td>
                  <td className="py-2 px-4">{d.scratches || "None recorded"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Dent</td>
                  <td className="py-2 px-4">{d.dent || "None recorded"}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Other Observations</td>
                  <td className="py-2 px-4">{d.anyOtherVisibleObservation || "None recorded"}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 bg-gray-50 font-semibold text-gray-800">Remarks</td>
                  <td className="py-2 px-4 italic text-gray-600">{d.anyRemark || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>

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
              <h3 className="text-lg font-bold text-gray-800">Send Vehicle Condition</h3>
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
                The Vehicle Condition Report PDF will be generated and sent as an attachment.
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
