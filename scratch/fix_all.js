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

  // 1. Fix the Top Action Bar Dropdown (if missed)
  const buttonContainerRegex = /<div className="flex flex-nowrap whitespace-nowrap items-center gap-4 print:hidden overflow-x-auto custom-scrollbar pb-1">([\s\S]*?<\/button>\s*)<\/div>/g;
  
  content = content.replace(buttonContainerRegex, (match, innerContent) => {
    if (innerContent.includes('isActionMenuOpen')) return match;

    const linkMatch = innerContent.match(/(<Link href=[\s\S]*?<\/Link>)/);
    const buttonsMatch = innerContent.match(/<button[\s\S]*?<\/button>/g);

    if (linkMatch && buttonsMatch) {
      const link = linkMatch[1];
      const buttonsString = buttonsMatch.join('\n            ');

      return `<div className="flex items-center gap-4 print:hidden">
          ${link}
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            ${buttonsString}
          </div>

          {/* Mobile Actions Dropdown */}
          <div className="md:hidden relative">
            <button 
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} 
              className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {isActionMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsActionMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 flex flex-col p-2 gap-2">
                  ${buttonsString}
                </div>
              </>
            )}
          </div>
        </div>`;
    }
    return match;
  });

  // 2. Fix the PDF Document Width (if missed)
  // Look for any div starting with max-w-5xl mx-auto bg-white that is the document wrapper
  content = content.replace(
    /className="max-w-5xl mx-auto bg-white/g,
    `className="min-w-[800px] md:min-w-0 max-w-5xl mx-auto bg-white`
  );
  // Prevent duplicate min-w-[800px] if we just added it to something that already had it
  content = content.replace(/min-w-\[800px\] md:min-w-0 min-w-\[800px\] md:min-w-0/g, `min-w-[800px] md:min-w-0`);

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated missing fixes for ${path.basename(file)}`);
  }
});
