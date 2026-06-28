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

export async function generateVehicleConditionPDF(docData: any, userProfile: any): Promise<string> {
  const doc = new jsPDF();
  const d = docData.details || {};
  const pData = userProfile?.profile || {};
  const companyName = pData.companyName || "COMPANY NAME PVT. LTD.";

  let yPos = 15;

  // --- Header Section ---
  const companyLogo = pData.companyLogo || siteAssets.logo;
  if (companyLogo) {
    try {
      const base64Logo = await getBase64ImageFromUrl(companyLogo);
      if (base64Logo) {
        const props = doc.getImageProperties(base64Logo);
        const ratio = props.width / props.height;
        let imgHeight = 20;
        let imgWidth = imgHeight * ratio;
        if (imgWidth > 50) {
          imgWidth = 50;
          imgHeight = imgWidth / ratio;
        }
        doc.addImage(base64Logo, props.fileType || "PNG", 14, yPos, imgWidth, imgHeight);
      }
    } catch (e) {
      console.error("Failed to load logo", e);
    }
  }

  doc.setTextColor(91, 33, 182); // Purple primary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(companyName, 200 - doc.getTextWidth(companyName) - 14, yPos + 8);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let headerTextY = yPos + 14;
  
  if (pData.addressLine1) {
    const addr = pData.addressLine1 + (pData.addressLine2 ? `, ${pData.addressLine2}` : '');
    doc.text(addr, 200 - doc.getTextWidth(addr) - 14, headerTextY);
    headerTextY += 5;
  }
  
  if (pData.city) {
    const locText = `${pData.city}, ${pData.state} ${pData.pincode}`;
    doc.text(locText, 200 - doc.getTextWidth(locText) - 14, headerTextY);
    headerTextY += 5;
  }

  let taxInfo = [];
  if (pData.gstNumber) taxInfo.push(`GSTIN: ${pData.gstNumber}`);
  if (pData.panCardNumber) taxInfo.push(`PAN: ${pData.panCardNumber}`);
  if (taxInfo.length > 0) {
    const taxText = taxInfo.join(" | ");
    doc.text(taxText, 200 - doc.getTextWidth(taxText) - 14, headerTextY);
    headerTextY += 5;
  }
  
  const contactText = `Phone: ${pData.mobileNumber || ''} | Email: ${pData.email || ''}`;
  doc.text(contactText, 200 - doc.getTextWidth(contactText) - 14, headerTextY);

  yPos = Math.max(headerTextY + 10, yPos + 30);

  // Title Box
  doc.setFillColor(91, 33, 182);
  doc.rect(14, yPos, 182, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const title = "VEHICLE CONDITION REPORT";
  doc.text(title, 105 - (doc.getTextWidth(title) / 2), yPos + 7);
  yPos += 15;

  // --- Vehicle Condition Details Table ---
  const conditionData = [
    ["Document No", docData.docNumber || "VC-Auto Generated"],
    ["LR Number", d.lrNumber || "N/A"],
    ["Party Name", d.partyName || "N/A"],
    ["Date", new Date(docData.date || Date.now()).toLocaleDateString()],
    ["Move From", d.moveFromAddress || "N/A"],
    ["Move To", d.moveToAddress || "N/A"],
    ["Phone", d.phone || "N/A"],
    ["Email", d.email || "N/A"],
  ];

  autoTable(doc as any, {
    startY: yPos,
    head: [["Condition Details", ""]],
    body: conditionData,
    theme: 'grid',
    headStyles: { fillColor: [243, 232, 255], textColor: [91, 33, 182], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold', fillColor: [250, 250, 250] }, 1: { cellWidth: 'auto' } },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 14, right: 14 }
  });
  yPos = (doc as any).lastAutoTable.finalY + 8;

  // --- Vehicle Details Table ---
  const vehicleData = [
    ["Vehicle Type", d.vehicleType || "N/A", "Vehicle Reg. No.", d.vehicleRegNo || "N/A"],
    ["Brand Name", d.vehicleBrandName || "N/A", "Mfg. Year", d.manufacturingYear || "N/A"],
    ["Vehicle Value", d.vehicleValue ? `Rs. ${d.vehicleValue}` : "N/A", "Colour", d.colour || "N/A"],
    ["Ins. Policy No.", d.insurancePolicyNo || "N/A", "Kilometers", d.vehicleKilometer || "N/A"],
    ["Ins. Company", d.insuranceCompanyName || "N/A", "Chassis No.", d.chassisNo || "N/A"],
    ["", "", "Engine No.", d.engineNo || "N/A"]
  ];

  autoTable(doc as any, {
    startY: yPos,
    head: [["Vehicle Information", "", "", ""]],
    body: vehicleData,
    theme: 'grid',
    headStyles: { fillColor: [243, 232, 255], textColor: [91, 33, 182], fontStyle: 'bold' },
    columnStyles: { 
      0: { cellWidth: 35, fontStyle: 'bold', fillColor: [250, 250, 250] }, 
      1: { cellWidth: 55 },
      2: { cellWidth: 35, fontStyle: 'bold', fillColor: [250, 250, 250] }, 
      3: { cellWidth: 55 }
    },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 14, right: 14 }
  });
  yPos = (doc as any).lastAutoTable.finalY + 8;

  // --- Accessories Details ---
  const acc = d.accessories || {};
  const renderYesNo = (val: string) => val === "yes" ? "YES" : "NO";
  
  const accData = [
    ["Stepney", renderYesNo(acc.stepney), "Digital Watch", renderYesNo(acc.digitalWatch)],
    ["Wheel Caps", renderYesNo(acc.wheelCaps), "Speaker", renderYesNo(acc.speaker)],
    ["Side Rear View Mirror", renderYesNo(acc.sideRearViewMirror), "Tool Kit", renderYesNo(acc.toolKit)],
    ["Car Radio/Player", renderYesNo(acc.carRadioPlayer), "Jack", renderYesNo(acc.jack)],
    ["Air Condition", renderYesNo(acc.airCondition), "Wiper Arms & Blades", renderYesNo(acc.wiperArmsBlades)],
    ["Lighter", renderYesNo(acc.lighter), "Mud Flap", renderYesNo(acc.mudFlap)],
    ["Floor Rubber Carpet", renderYesNo(acc.floorRubberCarpet), "Fuel (Petrol/Ltr)", renderYesNo(acc.fuel)],
    ["Car Cover", renderYesNo(acc.carCover), "", ""],
  ];

  autoTable(doc as any, {
    startY: yPos,
    head: [["Accessories Details", "", "", ""]],
    body: accData,
    theme: 'grid',
    headStyles: { fillColor: [243, 232, 255], textColor: [91, 33, 182], fontStyle: 'bold' },
    columnStyles: { 
      0: { cellWidth: 55, fillColor: [250, 250, 250] }, 
      1: { cellWidth: 35, fontStyle: 'bold', halign: 'center' },
      2: { cellWidth: 55, fillColor: [250, 250, 250] }, 
      3: { cellWidth: 35, fontStyle: 'bold', halign: 'center' }
    },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 }
  });
  yPos = (doc as any).lastAutoTable.finalY + 5;

  // Extra Accessories / Notes
  const extraAccData = [
    ["Battery No.", d.batteryNo || "N/A"],
    ["Tyre No.", d.tyreNo || "N/A"],
    ["Other Accessories", d.otherAccessories || "N/A"],
    ["Remarks", d.anyRemark || "N/A"]
  ];

  autoTable(doc as any, {
    startY: yPos,
    body: extraAccData,
    theme: 'grid',
    columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold', fillColor: [250, 250, 250] }, 1: { cellWidth: 'auto' } },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 14, right: 14 }
  });
  yPos = (doc as any).lastAutoTable.finalY + 8;

  // --- Dent & Scratches Details ---
  const damageData = [
    ["Scratches", d.scratches || "None recorded"],
    ["Dent", d.dent || "None recorded"],
    ["Other Observations", d.anyOtherVisibleObservation || "None recorded"],
  ];

  autoTable(doc as any, {
    startY: yPos,
    head: [["Dent / Scratches Details", ""]],
    body: damageData,
    theme: 'grid',
    headStyles: { fillColor: [243, 232, 255], textColor: [91, 33, 182], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold', fillColor: [250, 250, 250] }, 1: { cellWidth: 'auto' } },
    styles: { fontSize: 9, cellPadding: 5 },
    margin: { left: 14, right: 14 }
  });
  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Add Signatures
  yPos += 15;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

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

  // Return Base64
  const pdfOutput = doc.output("datauristring");
  return pdfOutput;
}
