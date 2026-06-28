import jsPDF from "jspdf";
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

export async function generateLorryReceiptPDF(lorryReceipt: any, userProfile: any): Promise<Blob> {
  const doc = new jsPDF("p", "pt", "a4");
  const d = lorryReceipt.details || {};
  const pData = userProfile?.profile || {};

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // 1. Watermark 
  const hasWatermark = userProfile?.hasWatermark ?? true;
  if (hasWatermark) {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(70);
    doc.setFont("helvetica", "bold");
    
    try {
      doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
    } catch(e) {}
    
    const offset = 35;
    const dx = offset * Math.sin(45 * Math.PI / 180);
    const dy = offset * Math.cos(45 * Math.PI / 180);
    
    doc.text("NEXTGEN", pageWidth / 2 - dx, pageHeight / 2 - dy, { align: "center", angle: 45 });
    doc.text("BILLING", pageWidth / 2 + dx, pageHeight / 2 + dy, { align: "center", angle: 45 });
    
    try {
      doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
    } catch(e) {}
  }

  // 2. HEADER
  let yPos = 55;

  // Logo
  const logoUrl = (pData?.companyLogo && pData.companyLogo.startsWith('http')) 
    ? pData.companyLogo 
    : siteAssets.logo;

  try {
    if (logoUrl) {
      const base64Img = await getBase64ImageFromUrl(logoUrl);
      const props = doc.getImageProperties(base64Img);
      const ratio = props.width / props.height;
      let imgWidth = 120;
      let imgHeight = imgWidth / ratio;
      
      if (imgHeight > 50) {
        imgHeight = 50;
        imgWidth = imgHeight * ratio;
      }
      
      const logoY = yPos - (imgHeight / 2) + 5; 
      
      doc.addImage(base64Img, props.fileType || "PNG", 40, logoY, imgWidth, imgHeight);
    }
  } catch (error) {
    console.error("Failed to load logo for PDF", error);
  }

  // Company Details
  doc.setFontSize(22);
  doc.setTextColor(91, 33, 182); // Purple branding
  doc.setFont("helvetica", "bold");
  const compName = pData.companyName || "COMPANY NAME PVT. LTD.";
  doc.text(compName, pageWidth - 40, yPos, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  yPos += 16;
  if (pData.addressLine1) {
    doc.text(`${pData.addressLine1}${pData.addressLine2 ? ', ' + pData.addressLine2 : ''}`, pageWidth - 40, yPos, { align: "right" });
    yPos += 14;
  }
  if (pData.city) {
    doc.text(`${pData.city}, ${pData.state} ${pData.pincode}`, pageWidth - 40, yPos, { align: "right" });
    yPos += 14;
  }
  
  const compDetails = [];
  if (pData.gstNumber) compDetails.push(`GSTIN: ${pData.gstNumber}`);
  if (pData.panCardNumber) compDetails.push(`PAN: ${pData.panCardNumber}`);
  if (compDetails.length > 0) {
    doc.text(compDetails.join(" | "), pageWidth - 40, yPos, { align: "right" });
    yPos += 14;
  }

  const contactDetails = [];
  if (pData.mobileNumber) contactDetails.push(`Phone: ${pData.mobileNumber}`);
  if (pData.email) contactDetails.push(`Email: ${pData.email}`);
  if (contactDetails.length > 0) {
    doc.text(contactDetails.join(" | "), pageWidth - 40, yPos, { align: "right" });
  }

  yPos += 30;

  // Divider
  doc.setDrawColor(91, 33, 182);
  doc.setLineWidth(2);
  doc.line(40, yPos, pageWidth - 40, yPos);
  
  yPos += 25;
  
  // TITLE
  doc.setFontSize(16);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");
  doc.text("LORRY RECEIPT / BILTY", pageWidth / 2, yPos, { align: "center", charSpace: 2 });

  yPos += 20;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.line(40, yPos, pageWidth - 40, yPos);
  yPos += 20;

  // Helper for amounts
  const fmtAmt = (amt: number) => amt.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  // Consignor & Consignee
  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    body: [
      [
        `CONSIGNOR (SENDER)\nName: ${d.consignorName || lorryReceipt.consignor || "N/A"}\nPhone: ${d.consignorPhone || "N/A"}\nEmail: ${d.consignorEmail || "N/A"}\nGSTIN: ${d.consignorGST || "N/A"}\nAddress: ${d.consignorAddress || "N/A"}`,
        `CONSIGNEE (RECEIVER)\nName: ${d.consigneeName || lorryReceipt.consignee || "N/A"}\nPhone: ${d.consigneePhone || "N/A"}\nGSTIN: ${d.consigneeGST || "N/A"}\nAddress: ${d.consigneeAddress || "N/A"}`
      ]
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 8, textColor: [0,0,0], cellWidth: (pageWidth - 80) / 2 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Route & Transport Info
  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    head: [['Document & Route Info', 'Transport Info']],
    body: [
      [
        `Doc No: ${lorryReceipt.docNumber}\nDate: ${new Date(lorryReceipt.date).toLocaleDateString("en-IN")}\nFrom: ${d.fromCity || "N/A"}\nTo: ${d.toCity || "N/A"}`,
        `Vehicle No: ${d.vehicleNo || "N/A"}\nDriver Name: ${d.driverName || "N/A"}\nDriver Phone: ${d.driverPhone || "N/A"}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 8, textColor: [0,0,0] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Goods Details
  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    head: [['Goods Details']],
    body: [
      [
        `Description: ${d.description || "N/A"}\nPackages: ${d.packages || "N/A"}   |   Weight: ${d.weight || "N/A"}\nDeclared Value: Rs. ${fmtAmt(Number(d.declaredValue) || 0)}   |   Marks: ${d.privateMarks || "N/A"}\nDelivery: ${d.deliveryType || "N/A"}   |   Payment Terms: ${d.paymentTerms || "N/A"}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 8, textColor: [0,0,0] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Charges
  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    head: [['Charges Breakdown']],
    body: [
      [
        `Freight: Rs. ${fmtAmt(Number(d.freight) || 0)}\nLR Charges: Rs. ${fmtAmt(Number(d.lrCharges) || 0)}\nLoading: Rs. ${fmtAmt(Number(d.loadingCharge) || 0)}\nUnloading: Rs. ${fmtAmt(Number(d.unloadingCharge) || 0)}\nOther: Rs. ${fmtAmt(Number(d.otherCharge) || 0)}\n\nTOTAL CHARGES: Rs. ${fmtAmt(Number(d.totalCharges) || 0)}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 8, textColor: [0,0,0] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  if (d.notes) {
    autoTable(doc, {
      startY: yPos,
      margin: { left: 40 },
      tableWidth: pageWidth - 80,
      body: [[`Notes: ${d.notes}`]],
      theme: 'plain',
      styles: { fontSize: 9, textColor: [100,100,100], fontStyle: 'italic', cellPadding: 8 }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Footer / Signatures FIRST
  yPos += 30; // give space for signatures
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 50;
  }

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Receiver's Signature", 40, yPos);
  
  doc.text(`For ${compName}`, pageWidth - 40, yPos, { align: "right" });
  
  yPos += 5;
  
  try {
    const stampUrl = userProfile?.companyStamp || pData.companyStamp;
    const signUrl = userProfile?.authorizedSignature || pData.authorizedSignature;
    
    let currentY = yPos;
    if (stampUrl) {
      const stampBase64 = await getBase64ImageFromUrl(stampUrl);
      const props = doc.getImageProperties(stampBase64);
      const ratio = props.width / props.height;
      let sHeight = 40; 
      let sWidth = sHeight * ratio;
      if (sWidth > 80) { sWidth = 80; sHeight = sWidth / ratio; }
      doc.addImage(stampBase64, props.fileType || "PNG", pageWidth - 40 - 40 - (sWidth/2), currentY, sWidth, sHeight);
      currentY += sHeight + 2;
    }
    
    if (signUrl) {
      const signBase64 = await getBase64ImageFromUrl(signUrl);
      const props = doc.getImageProperties(signBase64);
      const ratio = props.width / props.height;
      let sHeight = 30; 
      let sWidth = sHeight * ratio;
      if (sWidth > 90) { sWidth = 90; sHeight = sWidth / ratio; }
      doc.addImage(signBase64, props.fileType || "PNG", pageWidth - 40 - 40 - (sWidth/2), currentY, sWidth, sHeight);
      currentY += sHeight + 2;
    }
    
    yPos = Math.max(yPos + 25, currentY + 5); 
  } catch (e) {
    console.warn("Failed to load signature/stamp", e);
    yPos += 25;
  }

  doc.text("Authorized Signatory", pageWidth - 40, yPos, { align: "right" });

  yPos += 40; // add space before terms

  // Terms and conditions
  doc.setFontSize(14);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");
  
  if (yPos + 40 > pageHeight - 40) {
    doc.addPage();
    yPos = 40;
  }
  
  doc.text("Terms & Conditions:", 40, yPos);

  yPos += 5;
  doc.setDrawColor(91, 33, 182);
  doc.setLineWidth(1.5);
  doc.line(40, yPos, pageWidth - 40, yPos);

  yPos += 15;
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
    `Payment will be in the favour of ${compName} by Cash/Cheque.`,
    "All disputes are subject to Ranchi Jurisdiction."
  ];

  terms.forEach((term, index) => {
    const numberedTerm = `${index + 1}. ${term}`;
    const split = doc.splitTextToSize(numberedTerm, pageWidth - 80);
    const textHeight = split.length * 12;
    if (yPos + textHeight > pageHeight - 40) {
      doc.addPage();
      yPos = 40;
    }
    doc.text(split, 40, yPos);
    yPos += textHeight + 4;
  });

  return doc.output('blob');
}
