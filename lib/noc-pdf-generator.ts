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

export const generateNOCFormPDF = async (noc: any, userProfile: any): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const d = noc.details || {};

  // Default coordinates
  let yPos = 20;

  // Header Details
  const pData = userProfile?.profile || {};
  const companyName = pData.companyName || "Your Company";
  const address = pData.address || "Your Address";
  const city = pData.city || "City";
  const state = pData.state || "State";
  const pincode = pData.pincode || "000000";
  const mobile = pData.mobileNumber || "0000000000";
  const email = pData.email || "email@example.com";
  const gstin = pData.gstin || "";
  const pan = pData.pan || "";

  // 1) Logo
  const logoUrl = (pData?.companyLogo && pData.companyLogo.startsWith('http')) 
    ? pData.companyLogo 
    : siteAssets.logo;

  try {
    if (logoUrl) {
      const base64Img = await getBase64ImageFromUrl(logoUrl);
      if (base64Img) {
        const props = doc.getImageProperties(base64Img);
        const ratio = props.width / props.height;
        let imgHeight = 15;
        let imgWidth = imgHeight * ratio;
        if (imgWidth > 40) {
          imgWidth = 40;
          imgHeight = imgWidth / ratio;
        }
        doc.addImage(base64Img, props.fileType || "PNG", 14, yPos - 5, imgWidth, imgHeight);
      }
    }
  } catch (error) {
    console.warn("Could not add logo", error);
  }

  // 2) Company Info (Right Aligned)
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont("helvetica", "bold");
  doc.text(companyName, pageWidth - 14, yPos, { align: "right" });
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`${address}`, pageWidth - 14, yPos, { align: "right" });
  yPos += 5;
  doc.text(`${city}, ${state} ${pincode}`, pageWidth - 14, yPos, { align: "right" });
  yPos += 5;
  
  let taxInfo = [];
  if (gstin) taxInfo.push(`GSTIN: ${gstin}`);
  if (pan) taxInfo.push(`PAN: ${pan}`);
  if (taxInfo.length > 0) {
    doc.text(taxInfo.join(" | "), pageWidth - 14, yPos, { align: "right" });
    yPos += 5;
  }
  
  doc.text(`Phone: ${mobile} | Email: ${email}`, pageWidth - 14, yPos, { align: "right" });
  
  yPos += 15;

  

  // TITLE - in a box
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  const titleText = "NO OBJECTION CERTIFICATE (NOC)";
  doc.setDrawColor(91, 33, 182); // Purple
  doc.setFillColor(91, 33, 182); // Purple
  doc.rect(14, yPos, pageWidth - 28, 12, 'FD');
  doc.text(titleText, pageWidth / 2, yPos + 8, { align: "center" });

  yPos += 18;

  // Top info (Date & LR)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Document No:", 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(noc.docNumber || "N/A", 45, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("NOC Date:", pageWidth / 2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(noc.date ? new Date(noc.date).toLocaleDateString("en-IN") : "N/A", pageWidth / 2 + 25, yPos);

  yPos += 8;

  if (d.lrNo || d.lrDate) {
    doc.setFont("helvetica", "bold");
    doc.text("LR / Bilty No:", 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(d.lrNo || "N/A", 45, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("LR Date:", pageWidth / 2, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(d.lrDate ? new Date(d.lrDate).toLocaleDateString("en-IN") : "N/A", pageWidth / 2 + 25, yPos);
    yPos += 12;
  } else {
    yPos += 4;
  }

  // Draw main info tables
  const tableData1 = [
    ["Client / Consignor Name", noc.clientName || "N/A"],
    ["Phone / WhatsApp", d.phone || "N/A"],
    ["Email Address", d.email || "N/A"],
  ];

  autoTable(doc as any, {
    startY: yPos,
    head: [["Party Details", ""]],
    body: tableData1,
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', fillColor: [250, 250, 250] },
      1: { cellWidth: 'auto' }
    },
    styles: { fontSize: 10, cellPadding: 5 },
    margin: { left: 14, right: 14 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  const tableData2 = [
    ["Origin City", d.fromCity || "N/A"],
    ["Destination City", d.toCity || "N/A"],
    ["NOC Type", d.nocType || "N/A"]
  ];

  autoTable(doc as any, {
    startY: yPos,
    head: [["Route & Document Details", ""]],
    body: tableData2,
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', fillColor: [250, 250, 250] },
      1: { cellWidth: 'auto' }
    },
    styles: { fontSize: 10, cellPadding: 5 },
    margin: { left: 14, right: 14 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // Notes block
  if (d.notes) {
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Notes / Remarks:", 14, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const notesLines = doc.splitTextToSize(d.notes, pageWidth - 28);
    doc.text(notesLines, 14, yPos);
    yPos += notesLines.length * 5 + 10;
  }

  // Add Signatures
  yPos += 15;
  
  if (yPos > pageHeight - 30) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  doc.text("Customer's Signature", 14, yPos + 20);
  
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

  yPos += 15;

  // Terms and conditions
  doc.setFontSize(14);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");
  
  if (yPos + 15 > pageHeight - 15) {
    doc.addPage();
    yPos = 15;
  }
  
  doc.text("Terms & Conditions:", 14, yPos);

  yPos += 8;
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  const termsLines = [
    "1. We do not undertake Electrical, Carpentry & Plumber Job.",
    "2. The Vehicle transportation charges as given above as based on the present prevailing market rate.",
    "3. We or our agent shall be exempted from any kind of loss or damage done due to accident, pilferage, fire, rain collision or any other road/rive.",
    "4. Hazard Or any natural claim. So to avoid loss or damage we advise you to insure your consignment covering all risk. Please be noted while carrier",
    "5. Risk. On individual policy/receipt, from the insurance Company will be given.",
    "6. We request you to us 80% as advance on total amount along with your purchase order and the balance amount, on Completion of you're at loading point.",
    "7. The insurance premium will be paid in loading point only, before departure of your household consignment.",
    "8. If required we also provide storage facility to our customer at very nominal charge.",
    "9. We would be thankful, if you could give us prior intimation of 4-5 days in advance to start the packing of your valued articles. Car should have at least 10 Litters of Petrol.",
    "10. Extra payment will be charged for Wooden Packing on Moving Date.",
    "11. We are not responsible for Gold & Cash. Please keep in your custody lock.",
    "12. Interest will be charged @24% Per annum if the payment is not made within 15 days.",
    "13. Payment will be in the favour of " + companyName + " by Cash/Cheque.",
    "14. All disputes are subject to Ranchi Jurisdiction."
  ];

  termsLines.forEach(t => {
    if (yPos > pageHeight - 15) {
      doc.addPage();
      yPos = 20;
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
    }
    const splitted = doc.splitTextToSize(t, pageWidth - 28);
    doc.text(splitted, 14, yPos);
    yPos += splitted.length * 4;
  });

  return doc.output("blob");
};
