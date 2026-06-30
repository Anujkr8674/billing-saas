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
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // Replace `{profile?.hasWatermark !== false && (`
  content = content.replace(
    /\{profile\?\.hasWatermark !== false && \(/g,
    `{false && profile?.hasWatermark !== false && (`
  );

  // Replace `{hasWatermark && (`
  content = content.replace(
    /\{hasWatermark && \(/g,
    `{false && hasWatermark && (`
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Removed watermark from ${path.basename(file)}`);
  }
});
