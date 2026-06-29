"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { generateQuotationPDF } from "@/lib/pdf-generator";

export default function PDFViewerClient({ quotation, profile }: { quotation: any, profile: any }) {
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);

  useEffect(() => {
    if (quotation) {
      generateQuotationPDF(quotation, profile)
        .then(uri => setPdfDataUri(uri))
        .catch(err => console.error("PDF gen error", err));
    }
  }, [quotation, profile]);

  const handleDownload = () => {
    if (pdfDataUri) {
      const a = document.createElement("a");
      a.href = pdfDataUri;
      a.download = `Quotation_${quotation?.docNumber || "Doc"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-sm sm:text-2xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2 truncate whitespace-nowrap">
            <FileText className="w-6 h-6 text-primary" /> Billing & Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">View your generated quotation document below.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/user/quotations" className="text-primary hover:underline flex items-center gap-2 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Quotations</span><span className="sm:hidden">Back</span></Link>
          <button 
            onClick={handleDownload}
            disabled={!pdfDataUri}
            className="flex items-center gap-2 px-5 py-2 bg-[#1e40af] text-white font-medium rounded-lg hover:bg-[#1e40af]/90 transition-colors shadow-sm disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col relative min-h-0">
        {!pdfDataUri ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Generating High-Quality PDF...</p>
          </div>
        ) : (
          <iframe 
            src={`${pdfDataUri}#toolbar=0&view=FitH`}
            className="w-full h-full border-0 absolute inset-0" 
            title="PDF Preview"
          />
        )}
      </div>
    </>
  );
}
