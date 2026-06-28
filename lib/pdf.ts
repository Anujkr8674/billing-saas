import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFOptions {
  docType: string;
  docNumber: string;
  date: Date;
  clientName?: string;
  companyName?: string;
  companyLogo?: string;
  gstNumber?: string;
  address?: string;
  hasWatermark: boolean;
  details: any;
}

export const generatePDF = (options: PDFOptions) => {
  const doc = new jsPDF();
  
  const { docType, docNumber, date, clientName, companyName, gstNumber, address, hasWatermark, details } = options;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(91, 33, 182); // Primary Purple
  doc.text(companyName || 'NextGen Billing', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  if (address) doc.text(address, 14, 30);
  if (gstNumber) doc.text(`GSTIN: ${gstNumber}`, 14, 35);

  // Document Title
  doc.setFontSize(16);
  doc.setTextColor(0);
  const title = docType.toUpperCase();
  const textWidth = doc.getStringUnitWidth(title) * doc.getFontSize() / doc.internal.scaleFactor;
  const xOffset = (doc.internal.pageSize.width - textWidth) / 2;
  doc.text(title, xOffset, 50);

  // Metadata
  doc.setFontSize(10);
  doc.text(`${docType} No: ${docNumber}`, 14, 60);
  doc.text(`Date: ${new Date(date).toLocaleDateString()}`, 14, 65);
  if (clientName) {
    doc.text(`Billed To: ${clientName}`, 14, 75);
  }

  // Watermark
  if (hasWatermark) {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(50);
    // Rotate watermark
    doc.text('NEXTGEN BILLING', 40, 150, { angle: 45 });
  }

  // AutoTable (Assuming details is an array of items for generic invoices/quotations)
  if (Array.isArray(details) && details.length > 0) {
    const head = Object.keys(details[0]);
    const body = details.map(item => Object.values(item));

    autoTable(doc, {
      startY: 90,
      head: [head],
      body: body as any[],
      theme: 'grid',
      headStyles: { fillColor: [91, 33, 182] }, // Primary Purple
    });
  } else {
     // Generic JSON stringify if it's not a standard table
     doc.setFontSize(10);
     doc.setTextColor(0);
     const detailsString = JSON.stringify(details, null, 2);
     const splitText = doc.splitTextToSize(detailsString, 180);
     doc.text(splitText, 14, 90);
  }

  // Signature
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 100;
  doc.setFontSize(10);
  doc.text('Authorized Signature', 140, finalY + 40);

  // Save PDF
  doc.save(`${docType}_${docNumber}.pdf`);
};
