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

export async function generateLoadingSlipPDF(loadingSlip: any, userProfile: any) {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 40;

  const fmtAmt = (num: number) => num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const pData = userProfile?.profile || {};
  
  try {
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
  doc.setTextColor(91, 33, 182); // Purple color for loading slip theme
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
  
  // TITLE
  doc.setFontSize(16);
  doc.setTextColor(91, 33, 182);
  doc.setFont("helvetica", "bold");
  doc.text("LOADING SLIP", pageWidth / 2, yPos, { align: "center", charSpace: 2 });

  yPos += 10;
  doc.setLineWidth(1);
  doc.line(40, yPos, pageWidth - 40, yPos);

  yPos += 20;

  const d = loadingSlip.details || {};
  const docNumber = loadingSlip.docNumber || "LS";

  // Document Info
  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    head: [[{ content: 'Document Info', colSpan: 2 }]],
    body: [
      [`Doc Number: ${docNumber}`, `Date: ${d.date || new Date().toISOString().split('T')[0]}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5, textColor: [0,0,0] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Goods Owner Details Table
  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    head: [[{ content: 'Goods Owner Details', colSpan: 2 }]],
    body: [
      [`Name: ${d.ownerName || "N/A"}`, `Phone / WhatsApp: ${d.phone || "N/A"}`],
      [`Email: ${d.email || "N/A"}`, `PAN No: ${d.pan || "N/A"}`],
      [{ content: `Company Name: ${d.companyName || "N/A"}`, colSpan: 2 }]
    ],
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5, textColor: [0,0,0] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Vehicle, Route & Driver Details
  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    head: [[{ content: 'Vehicle, Route & Driver', colSpan: 2 }]],
    body: [
      [`Vehicle No: ${loadingSlip.vehicleNo || d.vehicleNo || "N/A"}`, `Size: ${d.vehicleSize || "N/A"}`],
      [`From: ${d.fromCity || "N/A"}`, `To: ${d.toCity || "N/A"}`],
      [`Driver Name: ${loadingSlip.driverName || d.driverName || "N/A"}`, `Driver Mobile: ${d.driverMobile || "N/A"}`],
      [{ content: `Driver Licence No: ${d.driverLicence || "N/A"}`, colSpan: 2 }]
    ],
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5, textColor: [0,0,0] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Freight & Charges Table
  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    head: [[{ content: 'Freight & Charges', colSpan: 3 }]],
    body: [
      [`Weight: ${d.weight || "N/A"}`, `Rate: ${d.rate || "N/A"}`, `Freight (Rs): ${fmtAmt(Number(d.freight) || 0)}`],
      [`Advance (Rs): ${fmtAmt(Number(d.advance) || 0)}`, `Balance (Rs): ${fmtAmt(Number(d.balance) || 0)}`, `Guarantee: ${d.guarantee || "N/A"}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5, textColor: [0,0,0] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Items Table
  const itemsBody = (d.items || []).map((item: any, i: number) => [
    i + 1,
    item.name,
    item.quantity,
    item.condition,
    item.remark
  ]);

  if (itemsBody.length > 0) {
    autoTable(doc, {
      startY: yPos,
      margin: { left: 40 },
      tableWidth: pageWidth - 80,
      head: [['#', 'Item / Particulars', 'Qty', 'Condition', 'Remarks']],
      body: itemsBody,
      theme: 'grid',
      headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' }, 
      styles: { fontSize: 9, cellPadding: 5, textColor: [0,0,0] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 30 },
        2: { halign: 'center', cellWidth: 50 },
        3: { halign: 'center', cellWidth: 80 },
      }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Detention & Notes
  autoTable(doc, {
    startY: yPos,
    margin: { left: 40 },
    tableWidth: pageWidth - 80,
    head: [[{ content: 'Detention & Notes', colSpan: 2 }]],
    body: [
      [`Detention Charge (Rs): ${fmtAmt(Number(d.detentionCharge) || 0)}`, `Detention Type: ${d.detentionType || "N/A"}`],
      [{ content: `Remark: ${d.detentionRemark || "N/A"}`, colSpan: 2 }],
      [{ content: `Notes: ${d.notes || ""}`, colSpan: 2 }]
    ],
    theme: 'grid',
    headStyles: { fillColor: [91, 33, 182], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5, textColor: [0,0,0] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Signatures
  if (yPos + 80 > pageHeight - 40) {
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

  yPos += 20;

  // Terms & Conditions
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
    "We request you to us 80% as advance on total amount along with your purchase order and the balance amount, on Completion of you're at loading point. The insurance premium will be paid in loading point only, before departure of your household consignment. The above rates quoted by keeping in view of our basis standard packing materials used in packing of your valued house hold articles.",
    "If required we also provide storage facility to our customer at very nominal charge.",
    "We would be thankful, if you could give us prior intimation of 4-5 days in advance to start the packing of your valued articles. Car should have at least 10 Litters of Petrol.",
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

  // Watermark for free/trial users
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
