const fs = require('fs');
const path = require('path');

const files = [
  'app/user/surveys/[id]/view/HTMLSurveyViewerClient.tsx',
  'app/user/quotations/[id]/view/HTMLQuotationViewerClient.tsx',
  'app/user/invoices/[id]/view/HTMLInvoiceViewerClient.tsx',
  'app/user/loading-slips/[id]/view/HTMLLoadingSlipViewerClient.tsx',
  'app/user/lorry-receipts/[id]/view/HTMLLorryReceiptViewerClient.tsx',
  'app/user/packing-lists/[id]/view/HTMLPackingListViewerClient.tsx',
  'app/user/payment-vouchers/[id]/view/HTMLPaymentVoucherViewerClient.tsx',
  'app/user/money-receipts/[id]/view/HTMLMoneyReceiptViewerClient.tsx',
  'app/user/vehicle-conditions/[id]/view/VehicleConditionViewerClient.tsx',
  'app/user/noc-forms/[id]/view/HTMLNOCFormViewerClient.tsx'
].map(f => path.join(__dirname, '..', f));

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // 1. Fix the header text size so it doesn't wrap on mobile
  content = content.replace(
    /<h1 className="text-2xl font-bold text-black flex items-center gap-2">/g,
    `<h1 className="text-base sm:text-xl md:text-2xl font-bold text-black flex items-center gap-2 truncate">`
  );

  // 2. Fix the "Back to ..." link text to just say "Back" on small screens
  // First, find the ArrowLeft and the text following it inside the Link
  content = content.replace(
    /(<ArrowLeft className="w-4 h-4" \/>\s*)(Back to [a-zA-Z\s]+)([\s\S]*?<\/Link>)/g,
    (match, p1, p2, p3) => {
      // If we already added the span, skip it to prevent double-wrapping
      if (p3.includes('<span className="hidden sm:inline">')) {
        return match;
      }
      return `${p1}<span className="hidden sm:inline">${p2}</span><span className="sm:hidden">Back</span>${p3}`;
    }
  );

  // Also reduce mr-4 to mr-2 sm:mr-4 for the Link itself
  content = content.replace(
    /className="text-primary hover:underline flex items-center gap-2 font-medium text-sm mr-4"/g,
    `className="text-primary hover:underline flex items-center gap-1 sm:gap-2 font-medium text-sm mr-2 sm:mr-4"`
  );
  
  // Specific fix for Vehicle Conditions which uses a different color class for the Link
  content = content.replace(
    /className="text-\[#5b21b6\] hover:underline flex items-center gap-2 font-medium text-sm mr-4"/g,
    `className="text-[#5b21b6] hover:underline flex items-center gap-1 sm:gap-2 font-medium text-sm mr-2 sm:mr-4"`
  );

  // 3. Fix the PDF cutting off issue by making the container scrollable horizontally and adding a min-width
  
  // The parent wrapper
  content = content.replace(
    /<div className="flex-1 overflow-y-auto custom-scrollbar pb-10 relative print:block print:overflow-visible print:h-auto">/g,
    `<div className="flex-1 overflow-auto custom-scrollbar pb-10 relative print:block print:overflow-visible print:h-auto">`
  );

  // The document wrapper
  content = content.replace(
    /<div className="max-w-5xl mx-auto bg-white shadow-xl rounded-sm border border-gray-200 relative overflow-hidden print:overflow-visible print:h-auto print:border-none print:shadow-none min-h-\[1122px\] print:!min-h-0">/g,
    `<div className="min-w-[800px] md:min-w-0 max-w-5xl mx-auto bg-white shadow-xl rounded-sm border border-gray-200 relative overflow-hidden print:overflow-visible print:h-auto print:border-none print:shadow-none min-h-[1122px] print:!min-h-0">`
  );
  
  // Just in case some have spaces differently
  content = content.replace(
    /className="max-w-5xl mx-auto bg-white shadow-xl rounded-sm border border-gray-200 relative overflow-hidden print:overflow-visible print:h-auto print:border-none print:shadow-none min-h-\[1122px\] print:!min-h-0"/g,
    `className="min-w-[800px] md:min-w-0 max-w-5xl mx-auto bg-white shadow-xl rounded-sm border border-gray-200 relative overflow-hidden print:overflow-visible print:h-auto print:border-none print:shadow-none min-h-[1122px] print:!min-h-0"`
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${path.basename(file)}`);
  }
});
