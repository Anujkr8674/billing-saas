const fs = require('fs');
const path = require('path');

const modules = [
  'surveys',
  'quotations',
  'invoices',
  'loading-slips',
  'lorry-receipts',
  'packing-lists',
  'payment-vouchers',
  'money-receipts',
  'vehicle-conditions',
  'noc-forms'
];

const basePath = path.join(__dirname, '..', 'app', 'user');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace text-2xl with text-lg sm:text-2xl in the viewer headers
  const targetLine = '<h1 className="text-2xl font-bold text-foreground flex items-center gap-2">';
  const replacementLine = '<h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">';
  
  content = content.replace(new RegExp(targetLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacementLine);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated header text size in: ${filePath}`);
  }
}

for (const mod of modules) {
  const idDir = path.join(basePath, mod, '[id]', 'view');
  
  // Since we don't know the exact name (HTMLMoneyReceiptViewerClient.tsx, HTMLQuotationViewerClient.tsx etc.)
  // We can just scan the directory if it exists
  if (fs.existsSync(idDir)) {
    const files = fs.readdirSync(idDir);
    for (const file of files) {
      if (file.endsWith('ViewerClient.tsx')) {
        processFile(path.join(idDir, file));
      }
    }
  }
}
