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

  // We are targeting the div that acts as the A4 paper:
  // <div className="max-w-5xl mx-auto bg-white shadow-xl ...
  // We want to ensure it has min-w-[800px] md:min-w-0

  if (!content.includes('min-w-[800px] md:min-w-0 max-w-5xl mx-auto')) {
    content = content.replace(
      /className="max-w-5xl mx-auto bg-white shadow-xl/g,
      `className="min-w-[800px] md:min-w-0 max-w-5xl mx-auto bg-white shadow-xl`
    );
  }

  // Double check that the parent container has overflow-auto
  if (content.includes('overflow-y-auto custom-scrollbar pb-10 relative print:block')) {
    content = content.replace(
      /<div className="flex-1 overflow-y-auto custom-scrollbar pb-10 relative print:block/g,
      `<div className="flex-1 overflow-auto custom-scrollbar pb-10 relative print:block`
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated width for ${path.basename(file)}`);
  }
});
