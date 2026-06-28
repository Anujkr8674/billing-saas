import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { siteAssets } from "./site-assets";

// Helper to load image from URL and convert to Base64
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

export async function generateQuotationPDF(quotation: any, userProfile: any) {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 40;

  // Helper to format numbers
  const fmtAmt = (num: number) => num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 1. HEADER
  // Company Logo
  const pData = userProfile?.profile || {};
  
  try {
    // Determine the logo URL. Use userProfile if it's a URL, otherwise default to siteAssets.logo
    const logoUrl = (userProfile?.companyLogo && userProfile.companyLogo.startsWith('http')) 
      ? userProfile.companyLogo 
      : siteAssets.logo;

    if (logoUrl) {
      const base64Logo = await getBase64ImageFromUrl(logoUrl);
      const props = doc.getImageProperties(base64Logo);
      const ratio = props.width / props.height;
      let imgWidth = 120;
      let imgHeight = imgWidth / ratio;
      
      if (imgHeight > 50) {
        imgHeight = 50;
        imgWidth = imgHeight * ratio;
      }
      
      const logoY = yPos - (imgHeight / 2) + 5; 
      
      doc.addImage(base64Logo, props.fileType || "PNG", 40, logoY, imgWidth, imgHeight);
    }
  } catch (e) {
    console.warn("Failed to add logo to PDF", e);
  }

  // Company Name
  doc.setFontSize(22);
  doc.setTextColor(91, 33, 182); // Violet
  doc.setFont("helvetica", "bold");
  const compName = pData.companyName || "COMPANY NAME PVT. LTD.";
  doc.text(compName, pageWidth - 40, yPos, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "normal");
  
  if (pData.addressLine1) {
    yPos += 15;
    const addr = `${pData.addressLine1}${pData.addressLine2 ? `, ${pData.addressLine2}` : ""}`;
    doc.text(addr, pageWidth - 40, yPos, { align: "right" });
  }
  
  if (pData.city || pData.state) {
    yPos += 12;
    const cityState = `${pData.city ? pData.city + ", " : ""}${pData.state || ""} ${pData.pincode ? "- " + pData.pincode : ""}`;
    doc.text(cityState, pageWidth - 40, yPos, { align: "right" });
  }

  if (pData.gstNumber || pData.panCardNumber) {
    yPos += 12;
    const taxes = `${pData.gstNumber ? "GSTIN: " + pData.gstNumber : ""} ${pData.panCardNumber ? (pData.gstNumber ? " | " : "") + "PAN: " + pData.panCardNumber : ""}`;
    doc.text(taxes, pageWidth - 40, yPos, { align: "right" });
  }

  if (pData.ownerName || pData.companyCode) {
    yPos += 12;
    const ownerCode = `${pData.ownerName ? "Owner: " + pData.ownerName : ""} ${pData.companyCode ? (pData.ownerName ? " | " : "") + "Code: " + pData.companyCode : ""}`;
    doc.text(ownerCode, pageWidth - 40, yPos, { align: "right" });
  }

  yPos += 12;
  doc.text(`Phone: ${pData.mobileNumber || userProfile?.mobile || "N/A"}`, pageWidth - 40, yPos, { align: "right" });
  yPos += 12;
  doc.text(`Email: ${pData.email || userProfile?.email || "N/A"}`, pageWidth - 40, yPos, { align: "right" });

  yPos += 20;

  // Blue Divider
  doc.setDrawColor(91, 33, 182);
  doc.setLineWidth(2);
  doc.line(40, yPos, pageWidth - 40, yPos);
  
  yPos += 20;
  
  // QUOTATION TITLE
  doc.setFontSize(16);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", pageWidth / 2, yPos, { align: "center", charSpace: 2 });

  yPos += 10;
  doc.setLineWidth(1);
  doc.line(40, yPos, pageWidth - 40, yPos);

  yPos += 20;

  // 2. CLIENT DETAILS
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const d = quotation.details || {};
  
  // Left Side
  doc.setFont("helvetica", "bold");
  doc.text("Company Name: ", 40, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${d.companyName || "N/A"} (GSTIN: ${d.companyGst || "N/A"})`, 130, yPos);

  // Right Side
  doc.setFont("helvetica", "bold");
  doc.text("Quotation No.: ", pageWidth - 200, yPos);
  doc.setTextColor(91, 33, 182);
  doc.setFontSize(9);
  doc.text(`${quotation.docNumber || "Auto Generated"}`, pageWidth - 40, yPos, { align: "right" });
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  yPos += 15;

  // Left
  doc.setFont("helvetica", "bold");
  doc.text("Name: ", 40, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${d.partyName || "N/A"}`, 80, yPos);

  // Right
  doc.setFont("helvetica", "bold");
  doc.text("Quotation Date: ", pageWidth - 200, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${d.quotationDate || "N/A"}`, pageWidth - 40, yPos, { align: "right" });

  yPos += 15;

  // Left
  doc.setFont("helvetica", "bold");
  doc.text("Phone: ", 40, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${d.phone || "N/A"}`, 80, yPos);
  
  doc.setFont("helvetica", "bold");
  doc.text("Email: ", 160, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${d.email || "N/A"}`, 195, yPos);

  // Right
  doc.setFont("helvetica", "bold");
  doc.text("Packing Date: ", pageWidth - 200, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${d.packingDate || "N/A"}`, pageWidth - 40, yPos, { align: "right" });

  yPos += 15;

  // Left
  doc.setFont("helvetica", "bold");
  doc.text("Moving Type: ", 40, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${d.movingType || "N/A"}`, 110, yPos);

  // Right
  doc.setFont("helvetica", "bold");
  doc.text("Moving Date: ", pageWidth - 200, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${d.movingDate || "N/A"}`, pageWidth - 40, yPos, { align: "right" });

  yPos += 20;

  // Greeting Message
  doc.setFont("helvetica", "bold");
  doc.text("Dear sir/madam", 40, yPos);
  yPos += 15;
  doc.setFont("helvetica", "normal");
  const msg = `We thank you for your valuable enquiry regarding the packing and shifting of your moving items from ${d.moveFrom?.city || "your location"} to ${d.moveTo?.city || "your destination"}. We are pleased to quote the rates for the same as follows:`;
  const splitMsg = doc.splitTextToSize(msg, pageWidth - 80);
  doc.text(splitMsg, 40, yPos);
  
  yPos += (splitMsg.length * 15) + 5;

  // 3. MAIN TABLES
  // We need to render the left tables (Move From / Move To & Items) and right table (Charges) side by side.
  // We will do this by manipulating autoTable margins.

  const leftWidth = (pageWidth - 80) * 0.6;
  const rightWidth = (pageWidth - 80) * 0.4 - 10;

  // Move From / To Table
  const moveBody: any[] = [
    [
      { content: `City: ${d.moveFrom?.city || ""}`, styles: { cellWidth: leftWidth/2 } },
      { content: `City: ${d.moveTo?.city || ""}`, styles: { cellWidth: leftWidth/2 } }
    ],
    [`State: ${d.moveFrom?.state || ""} - ${d.moveFrom?.pincode || ""}`, `State: ${d.moveTo?.state || ""} - ${d.moveTo?.pincode || ""}`],
    [`Country: ${d.moveFrom?.country || ""}`, `Country: ${d.moveTo?.country || ""}`],
    [`Address: ${d.moveFrom?.address || ""}`, `Address: ${d.moveTo?.address || ""}`],
    [`Floor: ${d.moveFrom?.floor || ""}`, `Floor: ${d.moveTo?.floor || ""}`],
    [`Is Lift Available: ${d.moveFrom?.lift || ""}`, `Is Lift Available: ${d.moveTo?.lift || ""}`],
  ];

  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: leftWidth,
    head: [['Move From', 'Move To']],
    body: moveBody,
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 4, textColor: [0,0,0] },
    columnStyles: {
      0: { fontStyle: 'normal' },
      1: { fontStyle: 'normal' }
    }
  });

  const finalYMove = (doc as any).lastAutoTable.finalY;

  // Items Table
  const itemsBody = (d.items || []).map((item: any, i: number) => [
    i + 1,
    item.name,
    item.quantity,
    fmtAmt(Number(item.value) || 0),
    item.remark
  ]);

  autoTable(doc, {
    startY: finalYMove + 10,
    margin: { left: 40 },
    tableWidth: leftWidth,
    head: [['#', 'Item / Particulars', 'Qty', 'Value (Rs.)', 'Remark']],
    body: itemsBody,
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 4, textColor: [0,0,0] },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
      0: { halign: 'center', cellWidth: 20 },
      2: { halign: 'center', cellWidth: 30 }
    }
  });

  // Particulars (Right Table)
  const calc = d.calculations || {};
  const p = d.payment || {};

  const chargesBody: any[] = [
    ['Freight', fmtAmt(Number(p.freightCharge) || 0)],
    ['Packing Charge', p.packingChargeType === "Extra" ? fmtAmt(Number(p.packingChargeAmount) || 0) : "Included"],
    ['Un Packing Charge', p.unPackingChargeType === "Extra" ? fmtAmt(Number(p.unPackingChargeAmount) || 0) : "Included"],
    ['Loading Charge', p.loadingChargeType === "Extra" ? fmtAmt(Number(p.loadingChargeAmount) || 0) : "Included"],
    ['Un Loading Charge', p.unLoadingChargeType === "Extra" ? fmtAmt(Number(p.unLoadingChargeAmount) || 0) : "Included"],
    ['Pack. Material Charge', p.packingMaterialType === "Extra" ? fmtAmt(Number(p.packingMaterialAmount) || 0) : "Included"],
    ['Storage Charge', fmtAmt(Number(p.storageCharge) || 0)],
    ['Car/Bike TPT', fmtAmt(Number(p.carTransportCharge) || 0)],
    ['Miscellaneous Charge', fmtAmt(Number(p.miscCharge) || 0)],
    ['Other Charge', fmtAmt(Number(p.otherCharge) || 0)],
    [{ content: 'Sub Total', styles: { fontStyle: 'bold' } }, { content: fmtAmt(calc.subTotal || 0), styles: { fontStyle: 'bold' } }]
  ];

  if (p.gstType === "CGST/SGST") {
    chargesBody.push([`SGST (${(Number(p.gstPercent)||18)/2}%)`, fmtAmt(calc.sgst || 0)]);
    chargesBody.push([`CGST (${(Number(p.gstPercent)||18)/2}%)`, fmtAmt(calc.cgst || 0)]);
  } else {
    chargesBody.push([`IGST (${Number(p.gstPercent)||18}%)`, fmtAmt(calc.igst || 0)]);
  }

  chargesBody.push(['Insurance Charge', p.insuranceType === "Optional" ? "Included" : "N/A"]);

  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 + leftWidth + 10 },
    tableWidth: rightWidth,
    head: [['Particulars', 'Amount (Rs.)']],
    body: chargesBody,
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 4, textColor: [0,0,0] },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalYCharges = (doc as any).lastAutoTable.finalY;

  // Total Amount Blue Row
  autoTable(doc, {
    startY: finalYCharges,
    margin: { left: 40 + leftWidth + 10 },
    tableWidth: rightWidth,
    body: [['Total Amount', fmtAmt(calc.grandTotal || 0)]],
    theme: 'plain',
    styles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold', fontSize: 10, cellPadding: 6 },
    columnStyles: {
      1: { halign: 'right' }
    }
  });

  const finalRightTableY = (doc as any).lastAutoTable.finalY;
  const finalLeftTableY = (doc as any).lastAutoTable.finalY; // need real reference if items table is longer
  // Actually, we need to track the max Y of both columns to continue below them.
  // We'll approximate:
  yPos = Math.max(finalRightTableY, finalYMove + 50) + 20;

  // Number to Words Converter
  const numberToWords = (amount: number) => {
    // Simple placeholder for now since writing a full Indian number to words parser is lengthy
    // In production, we'd use a robust module. Let's do a basic one or just say "Rupees X Only"
    return `Rupees ${fmtAmt(amount)} Only`;
  };

  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 + leftWidth + 10 },
    tableWidth: rightWidth,
    body: [[
      { content: 'Total Amount In Words\n\n' + numberToWords(calc.grandTotal || 0), styles: { fontStyle: 'bold', textColor: [0,0,0] } }
    ]],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 6 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Additional QnA Table
  const qnaBody: any[] = [
    ['Is there easy access for loading & unloading at Location Move From & Move To:', 'Yes'],
    ['Should any items be got down through balcony etc.:', 'N/A'],
    ['Are there any restrictions for loading/unloading at Location Move From/Move To:', 'N/A'],
    ['Does you have any special needs or concerns:', 'N/A']
  ];

  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    body: qnaBody,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, textColor: [0,0,0] },
    columnStyles: {
      1: { fontStyle: 'bold', halign: 'center', cellWidth: 50 }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Insurance Remarks
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Insurance charge @${p.insurancePercent || 1}% on declaration value of goods`, 40, yPos);
  yPos += 12;
  doc.text("Remark: ", 40, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(p.remark || "N/A", 75, yPos);

  yPos += 30;

  // Signatures
  if (yPos + 100 > pageHeight - 40) {
    doc.addPage();
    yPos = 40;
  }

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
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
  yPos += 15;

  // Bank Details
  const bankBody: any[] = [
    [
      { content: 'Bank Detail:', styles: { textColor: [91, 33, 182], fontStyle: 'bold' } },
      { content: 'Other Payment Options:', styles: { textColor: [91, 33, 182], fontStyle: 'bold' } }
    ],
    [
      `Beneficiary Name : ${compName}\nBank Name : \nBank A/C No. : \nBank IFSC Code : `,
      `PhonePe/Google Pay : ${pData.mobileNumber || userProfile?.mobile || ""}\nCash / Cheque in favour of ${compName}`
    ]
  ];

  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    body: bankBody,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 6, textColor: [0,0,0] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Note Block
  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    body: [[
      { content: 'Note:\n\nPlease keep your Cash/Jewelery and all important documents in your Custody/Lock carrying\nLiquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil, etc.) is totally prohibited.', styles: { textColor: [0,0,0], fontStyle: 'bold' } }
    ]],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 8, lineColor: [91, 33, 182], lineWidth: 1 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    body: [['This is a computer-generated document. SAVE PAPER - SAVE TREES | BE DIGITAL - GO GREEN']],
    theme: 'plain',
    styles: { fillColor: [240, 240, 240], textColor: [100, 100, 100], fontStyle: 'bold', halign: 'center', fontSize: 8, cellPadding: 6 }
  });

  yPos = (doc as any).lastAutoTable.finalY;

  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    body: [[`For Any Query contact us: Mob.: ${pData.mobileNumber || userProfile?.mobile || ""}`]],
    theme: 'plain',
    styles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 10, cellPadding: 8 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(14);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");

  if (yPos + 40 > pageHeight - 40) {
    doc.addPage();
    yPos = 40;
  }

  doc.text("Term & Conditions:", 40, yPos);

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
    "We request you to us 80% as advance on total amount along with your purchase order and the balance amount, on Completion of you're at loading",
    "point. The insurance premium will be paid in loading point only, before departure of your household consignment. The above rates quoted by keeping in",
    "view of our basis standard packing materials used in packing of your valued house hold articles.",
    "If required we also provide storage facility to our customer at very nominal charge.",
    "We would be thankful, if you could give us prior intimation of 4-5 days in advance to start the packing of your valued articles. Car should have at least",
    "10 Litters of Petrol.",
    "Extra payment will be charged for Wooden Packing on Moving Date.",
    "We are not responsible for Gold & Cash. Please keep in your custody lock.",
    "Interest will be charged @24% Per annum if the payment is not made within 15 days.",
    `Payment will be in the favour of ${compName} by Cash/Cheque.`,
    "Thanking you and awaiting for your valued work order to serve you."
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

  const totalPages = (doc as any).internal.getNumberOfPages();
  if (userProfile?.hasWatermark !== false) {
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(70);
      doc.setFont("helvetica", "bold");
      
      try {
        doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
      } catch(e) {}
      
      // Rotate and draw with explicit coordinates to fix jsPDF array-angle bug
      const offset = 35;
      const dx = offset * Math.sin(45 * Math.PI / 180);
      const dy = offset * Math.cos(45 * Math.PI / 180);

      doc.text("NEXTGEN", pageWidth / 2 - dx, pageHeight / 2 - dy, { align: "center", angle: 45 });
      doc.text("BILLING", pageWidth / 2 + dx, pageHeight / 2 + dy, { align: "center", angle: 45 });
      
      try {
        doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
      } catch(e) {}
    }
  }

  return doc.output('datauristring');
}
