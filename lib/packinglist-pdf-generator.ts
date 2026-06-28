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

export async function generatePackingListPDF(packingList: any, userProfile: any): Promise<Blob> {
  const doc = new jsPDF();
  const d = packingList.details || {};
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
  let yPos = 20;

  // Logo
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
      
      doc.addImage(base64Img, props.fileType || "PNG", 14, 14, imgWidth, imgHeight);
    }
  } catch (error) {
    console.error("Failed to load logo for PDF", error);
  }

  // Company Details
  doc.setFontSize(22);
  doc.setTextColor(91, 33, 182); // Purple branding
  doc.setFont("helvetica", "bold");
  const compName = pData.companyName || "COMPANY NAME PVT. LTD.";
  doc.text(compName, pageWidth - 14, yPos, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  yPos += 6;
  if (pData.addressLine1) {
    doc.text(`${pData.addressLine1}${pData.addressLine2 ? ', ' + pData.addressLine2 : ''}`, pageWidth - 14, yPos, { align: "right" });
    yPos += 5;
  }
  if (pData.city) {
    doc.text(`${pData.city}, ${pData.state} ${pData.pincode}`, pageWidth - 14, yPos, { align: "right" });
    yPos += 5;
  }
  
  const compDetails = [];
  if (pData.gstNumber) compDetails.push(`GSTIN: ${pData.gstNumber}`);
  if (pData.panCardNumber) compDetails.push(`PAN: ${pData.panCardNumber}`);
  if (compDetails.length > 0) {
    doc.text(compDetails.join(" | "), pageWidth - 14, yPos, { align: "right" });
    yPos += 5;
  }

  const contactDetails = [];
  if (pData.mobileNumber) contactDetails.push(`Phone: ${pData.mobileNumber}`);
  if (pData.email) contactDetails.push(`Email: ${pData.email}`);
  if (contactDetails.length > 0) {
    doc.text(contactDetails.join(" | "), pageWidth - 14, yPos, { align: "right" });
  }

  yPos += 15;

  // Divider
  doc.setDrawColor(91, 33, 182);
  doc.setLineWidth(1);
  doc.line(14, yPos, pageWidth - 14, yPos);
  
  yPos += 10;
  
  // TITLE - in a box
  doc.setFontSize(12);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");
  const titleText = "P A C K I N G   L I S T";
  const titleWidth = doc.getTextWidth(titleText) + 20;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(249, 250, 251);
  doc.rect((pageWidth - titleWidth) / 2, yPos, titleWidth, 10, 'FD');
  doc.text(titleText, pageWidth / 2, yPos + 6.5, { align: "center" });

  yPos += 18;

  // Helper for amounts
  const fmtAmt = (amt: number) => amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Customer & Shifting Details - Side by Side Custom Boxes
  const boxWidth = (pageWidth - 36) / 2;
  const boxHeight = 50;

  // --- Box 1: Customer Details ---
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(255, 255, 255);
  doc.rect(14, yPos, boxWidth, boxHeight, 'FD');
  
  doc.setFontSize(9);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER DETAILS", 18, yPos + 6);
  doc.setDrawColor(240, 240, 240);
  doc.line(18, yPos + 8, 14 + boxWidth - 4, yPos + 8);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(d.customerName || packingList.clientName || "N/A", 18, yPos + 14);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  let custY = yPos + 20;
  if (d.phone) {
    doc.setTextColor(100, 100, 100);
    doc.text("Phone: ", 18, custY);
    doc.setTextColor(0, 0, 0);
    doc.text(d.phone, 18 + doc.getTextWidth("Phone: "), custY);
    custY += 5;
  }
  if (d.email) {
    doc.setTextColor(100, 100, 100);
    doc.text("Email: ", 18, custY);
    doc.setTextColor(0, 0, 0);
    doc.text(d.email, 18 + doc.getTextWidth("Email: "), custY);
    custY += 5;
  }
  if (d.address) {
    doc.setTextColor(100, 100, 100);
    const splitAddr = doc.splitTextToSize(d.address, boxWidth - 8);
    doc.text(splitAddr, 18, custY);
  }

  // --- Box 2: Shifting Details ---
  const box2X = 14 + boxWidth + 8;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(255, 255, 255);
  doc.rect(box2X, yPos, boxWidth, boxHeight, 'FD');
  
  doc.setFillColor(91, 33, 182);
  doc.rect(box2X, yPos, boxWidth, 8, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Shifting Details", box2X + 4, yPos + 5.5);
  
  const shiftLines = [
    { label: "Doc No:", val: packingList.docNumber },
    { label: "Packing Date:", val: packingList.date ? new Date(packingList.date).toLocaleDateString("en-IN") : "N/A" },
    { label: "Shifting Date:", val: d.shiftingDate ? new Date(d.shiftingDate).toLocaleDateString("en-IN") : "N/A" },
    { label: "From -> To:", val: `${d.fromCity || "N/A"} -> ${d.toCity || "N/A"}` },
    { label: "Vehicle No:", val: d.vehicleNo || "N/A" },
    { label: "Packed By:", val: d.packedBy || "N/A" }
  ];
  
  let shiftY = yPos + 13;
  shiftLines.forEach(line => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(line.label, box2X + 4, shiftY);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(line.val, box2X + 30, shiftY);
    shiftY += 6;
  });

  yPos += boxHeight + 8;

  // Packing Items Table
  const items = d.items || [];
  const tableData = items.map((item: any, index: number) => [
    index + 1,
    item.name || "-",
    item.boxNumber || "-",
    item.quantity || "1",
    item.value ? fmtAmt(Number(item.value)) : "-",
    item.cft ? Number(item.cft).toFixed(2) : "-",
    item.remark || "-"
  ]);

  const totalQuantity = items.reduce((acc: number, curr: any) => acc + (Number(curr.quantity) || 0), 0);

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Item / Particulars Name', 'Box Number', 'Quantity', 'Value (Rs.)', 'CFT', 'Remark']],
    body: tableData,
    foot: [
      ['', 'TOTAL ITEMS', '', `${totalQuantity}`, '', '', '']
    ],
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [243, 232, 255], textColor: [91, 33, 182], fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 30 },
      5: { halign: 'center', cellWidth: 15 },
      6: { halign: 'left' },
    },
    styles: { fontSize: 9, cellPadding: 4, textColor: [0,0,0] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 5;

  if (d.notes) {
    autoTable(doc, {
      startY: yPos,
      body: [[`Notes: ${d.notes}`]],
      theme: 'plain',
      styles: { fontSize: 9, textColor: [100,100,100], fontStyle: 'italic' }
    });
    yPos = (doc as any).lastAutoTable.finalY + 5;
  }

  // Footer / Signatures FIRST
  yPos += 10; // give space for signatures
  if (yPos > pageHeight - 30) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Customer's Signature", 14, yPos);
  
  doc.text(`For ${compName}`, pageWidth - 14, yPos, { align: "right" });
  
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
    `Payment will be in the favour of ${compName} by Cash/Cheque.`,
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

  return doc.output('blob');
}
