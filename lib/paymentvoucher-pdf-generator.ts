import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { siteAssets } from "./site-assets";

async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("/")) {
    if (typeof window === "undefined") {
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), "public", imageUrl);
        const buffer = fs.readFileSync(filePath);
        const mimeType = imageUrl.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
        return `data:${mimeType};base64,${buffer.toString("base64")}`;
      } catch (err) {
        return "";
      }
    } else {
      try {
        const finalUrl = window.location.origin + imageUrl;
        const res = await fetch(finalUrl);
        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = res.headers.get('content-type') || 'image/png';
        return `data:${mimeType};base64,${base64}`;
      } catch(e) { return ""; }
    }
  } else {
    try {
      const res = await fetch(imageUrl);
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = res.headers.get('content-type') || 'image/png';
      return `data:${mimeType};base64,${base64}`;
    } catch (err) {
      return "";
    }
  }
}

export const generatePaymentVoucherPDF = async (voucher: any, userProfile: any): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const d = voucher.details || {};

  // Default coordinates
  let yPos = 20;

  // Header Details
  const pData = userProfile?.profile || {};
  const companyName = pData.companyName || "COMPANY NAME PVT. LTD.";

  // 1) Logo
  const logoUrl = (pData?.companyLogo && pData.companyLogo.startsWith('http')) 
    ? pData.companyLogo 
    : siteAssets.logo;

  try {
    if (logoUrl) {
      const base64Img = await getBase64ImageFromUrl(logoUrl);
      const props = doc.getImageProperties(base64Img);
      const ratio = props.width / props.height;
      let imgWidth = 45;
      let imgHeight = imgWidth / ratio;
      
      if (imgHeight > 20) {
        imgHeight = 20;
        imgWidth = imgHeight * ratio;
      }
      doc.addImage(base64Img, props.fileType || "PNG", 14, yPos - 5, imgWidth, imgHeight);
    }
  } catch (error) {
    console.warn("Could not add logo", error);
  }

  // 2) Company Info (Right Aligned)
  doc.setFontSize(18);
  doc.setTextColor(91, 33, 182); // Purple: #5b21b6
  doc.setFont("helvetica", "bold");
  doc.text(companyName, pageWidth - 14, yPos, { align: "right" });
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  
  if (pData.addressLine1) {
    doc.text(`${pData.addressLine1}${pData.addressLine2 ? ', ' + pData.addressLine2 : ''}`, pageWidth - 14, yPos, { align: "right" });
    yPos += 5;
  }
  
  if (pData.city) {
    doc.text(`${pData.city}, ${pData.state} ${pData.pincode}`, pageWidth - 14, yPos, { align: "right" });
    yPos += 5;
  }
  
  let taxInfo = [];
  if (pData.gstNumber) taxInfo.push(`GSTIN: ${pData.gstNumber}`);
  if (pData.panCardNumber) taxInfo.push(`PAN: ${pData.panCardNumber}`);
  if (taxInfo.length > 0) {
    doc.text(taxInfo.join(" | "), pageWidth - 14, yPos, { align: "right" });
    yPos += 5;
  }
  
  doc.text(`Phone: ${pData.mobileNumber || userProfile?.mobile || "N/A"} | Email: ${pData.email || userProfile?.email || "N/A"}`, pageWidth - 14, yPos, { align: "right" });
  
  yPos += 15;

  

  // Divider
  doc.setDrawColor(91, 33, 182);
  doc.setLineWidth(1);
  doc.line(14, yPos, pageWidth - 14, yPos);
  
  yPos += 10;

  // TITLE
  doc.setFontSize(14);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");
  doc.text("P A Y M E N T   V O U C H E R", pageWidth / 2, yPos, { align: "center" });

  yPos += 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, yPos, pageWidth - 14, yPos);
  
  yPos += 10;

  // Custom Boxes for Payee Details and Payment Details
  const boxWidth = (pageWidth - 36) / 2;
  const boxHeight = 55;

  // --- Box 1: Payee Details ---
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(255, 255, 255);
  doc.rect(14, yPos, boxWidth, boxHeight, 'FD');
  
  doc.setFontSize(9);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");
  doc.text("PAYEE DETAILS", 18, yPos + 6);
  doc.setDrawColor(240, 240, 240);
  doc.line(18, yPos + 8, 14 + boxWidth - 4, yPos + 8);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(voucher.paidTo || "N/A", 18, yPos + 14);
  

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  let leftY = yPos + 22;
  if (d.phone) {
    doc.setTextColor(100, 100, 100);
    doc.text("Phone: ", 18, leftY);
    doc.setTextColor(0, 0, 0);
    doc.text(d.phone, 18 + doc.getTextWidth("Phone: "), leftY);
    leftY += 6;
  }
  if (d.email) {
    doc.setTextColor(100, 100, 100);
    doc.text("Email: ", 18, leftY);
    doc.setTextColor(0, 0, 0);
    doc.text(d.email, 18 + doc.getTextWidth("Email: "), leftY);
    leftY += 6;
  }
  if (d.approvedBy) {
    doc.setTextColor(100, 100, 100);
    doc.text("Approved By: ", 18, leftY);
    doc.setTextColor(0, 0, 0);
    doc.text(d.approvedBy, 18 + doc.getTextWidth("Approved By: "), leftY);
  }

  // --- Box 2: Payment Details ---
  const box2X = 14 + boxWidth + 8;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(255, 255, 255);
  doc.rect(box2X, yPos, boxWidth, boxHeight, 'FD');
  
  doc.setFillColor(91, 33, 182);
  doc.rect(box2X, yPos, boxWidth, 8, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", box2X + 4, yPos + 5.5);
  
  const rightLines = [
    { label: "Doc No:", val: voucher.docNumber },
    { label: "Date:", val: voucher.date ? new Date(voucher.date).toLocaleDateString("en-IN") : "N/A" },
    { label: "Payment Mode:", val: d.paymentMode || "Cash" },
    { label: "Ref/Cheque No:", val: d.referenceNo || "N/A" },
    { label: "Amount:", val: `Rs. ${(voucher.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` }
  ];
  
  let rightY = yPos + 14;
  rightLines.forEach(line => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(line.label, box2X + 4, rightY);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    if (line.label === "Amount:") doc.setTextColor(91, 33, 182);
    doc.text(line.val, box2X + 35, rightY);
    rightY += 7;
  });

  yPos += boxHeight + 10;

  // Purpose block
  if (d.purpose) {
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(249, 250, 251);
    doc.rect(14, yPos, pageWidth - 28, 20, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Purpose of Payment:", 18, yPos + 7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const purposeLines = doc.splitTextToSize(d.purpose, pageWidth - 36);
    doc.text(purposeLines, 18, yPos + 14);
    yPos += 30;
  }

  // Notes block
  if (d.notes) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    doc.text("Notes:", 14, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const notesLines = doc.splitTextToSize(d.notes, pageWidth - 28);
    doc.text(notesLines, 14, yPos);
    yPos += notesLines.length * 5 + 10;
  }

  // Add Signatures
  yPos += 10;
  if (yPos > pageHeight - 30) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Receiver's Signature", 14, yPos);
  
  doc.text(`For ${companyName}`, pageWidth - 14, yPos, { align: "right" });
  
  yPos += 3;
  
  try {
    const stampUrl = userProfile?.companyStamp || pData.companyStamp;
    const signUrl = userProfile?.authorizedSignature || pData.authorizedSignature;
    
    let currentY = yPos;
    if (stampUrl) {
      const stampBase64 = await getBase64ImageFromUrl(stampUrl);
      const props = doc.getImageProperties(stampBase64);
      const ratio = props.width / props.height;
      let sHeight = 14; 
      let sWidth = sHeight * ratio;
      if (sWidth > 28) { sWidth = 28; sHeight = sWidth / ratio; }
      doc.addImage(stampBase64, props.fileType || "PNG", pageWidth - 14 - 14 - (sWidth/2), currentY, sWidth, sHeight);
      currentY += sHeight + 1;
    }
    
    if (signUrl) {
      const signBase64 = await getBase64ImageFromUrl(signUrl);
      const props = doc.getImageProperties(signBase64);
      const ratio = props.width / props.height;
      let sHeight = 10; 
      let sWidth = sHeight * ratio;
      if (sWidth > 32) { sWidth = 32; sHeight = sWidth / ratio; }
      doc.addImage(signBase64, props.fileType || "PNG", pageWidth - 14 - 14 - (sWidth/2), currentY, sWidth, sHeight);
      currentY += sHeight + 1;
    }
    
    yPos = Math.max(yPos + 8, currentY + 4); 
  } catch (e) {
    console.warn("Failed to load signature/stamp", e);
    yPos += 8;
  }

  doc.text("Authorized Signatory", pageWidth - 14, yPos, { align: "right" });

  yPos += 15; // add space before terms

  // Terms and conditions
  doc.setFontSize(14);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");
  
  if (yPos + 15 > pageHeight - 15) {
    doc.addPage();
    yPos = 15;
  }
  
  doc.text("Terms & Conditions:", 14, yPos);

  yPos += 2;
  doc.setDrawColor(91, 33, 182);
  doc.setLineWidth(0.5);
  doc.line(14, yPos, pageWidth - 14, yPos);

  yPos += 5;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  const terms = [
    "We do not undertake Electrical, Carpentry & Plumber Job.",
    "The Vehicle transportation charges as given above as based on the present prevailing market rate.",
    "We or our agent shall be exempted from any kind of loss or damage done due to accident, pilferage, fire, rain collision or any other road/rive.",
    "Hazard Or any natural claim. So to avoid loss or damage we advise you to insure your consignment covering all risk. Please be noted while carrier",
    "Risk. On individual policy/receipt, from the insurance Company will be given.",
    "We request you to us 80% as advance on total amount along with your purchase order and the balance amount, on Completion of you're at loading point. The insurance premium will be paid in loading point only, before departure of your household consignment. The above rates quoted by keeping in view of our basis standard packing materials used in packing of your valued house hold articles.",
    "If required we also provide storage facility to our customer at very nominal charge.",
    "We would be thankful, if you could give us prior intimation of 4-5 days in advance to start the packing of your valued articles. Car should have at least 10 Litters of Petrol.",
    "Extra payment will be charged for Wooden Packing on Moving Date.",
    "We are not responsible for Gold & Cash. Please keep in your custody lock.",
    "Interest will be charged @24% Per annum if the payment is not made within 15 days.",
    `Payment will be in the favour of ${companyName} by Cash/Cheque.`,
    "All disputes are subject to Ranchi Jurisdiction."
  ];

  terms.forEach((term, index) => {
    const numberedTerm = `${index + 1}. ${term}`;
    const split = doc.splitTextToSize(numberedTerm, pageWidth - 28);
    const textHeight = split.length * 4;
    if (yPos + textHeight > pageHeight - 14) {
      doc.addPage();
      yPos = 14;
    }
    doc.text(split, 14, yPos);
    yPos += textHeight + 2;
  });

  return doc.output("blob");
};
