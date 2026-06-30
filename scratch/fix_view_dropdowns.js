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

  // We are looking for the div that wraps the action buttons, which might be:
  // <div className="flex items-center gap-2 print:hidden whitespace-nowrap">
  // or <div className="flex flex-nowrap whitespace-nowrap items-center gap-4 print:hidden overflow-x-auto custom-scrollbar pb-1">
  
  const buttonContainerRegex = /<div className="flex (?:flex-nowrap whitespace-nowrap )?items-center gap-[24] print:hidden[^>]*>([\s\S]*?<\/button>\s*)<\/div>/g;
  
  content = content.replace(buttonContainerRegex, (match, innerContent) => {
    // If it already has the mobile dropdown logic, skip
    if (innerContent.includes('isActionMenuOpen')) return match;

    const linkMatch = innerContent.match(/(<Link href=[\s\S]*?<\/Link>)/);
    // Find all buttons inside
    const buttonsMatch = innerContent.match(/<button[\s\S]*?<\/button>|<Link[\s\S]*?<Edit[\s\S]*?<\/Link>/g);
    
    // Note: some have an 'Edit' Link among the buttons instead of just <button>! We capture that too.
    
    if (linkMatch && buttonsMatch) {
      // The first link is usually "Back to ..." 
      // But if Edit link is also matched, we have to distinguish.
      // We already know the first link is "Back" because it's first in innerContent.
      
      const link = linkMatch[1];
      // Filter out the 'Back to' link from the buttonsMatch if it was caught
      const actionButtons = buttonsMatch.filter(b => !b.includes('Back'));
      const buttonsString = actionButtons.join('\n            ');

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

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated view dropdowns for: ${path.basename(file)}`);
  }
});
