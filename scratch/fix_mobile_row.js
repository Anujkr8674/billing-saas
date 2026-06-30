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

  // 1. Fix the container to not wrap and not be flex-col
  // <div className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
  content = content.replace(/flex flex-col sm:flex-row/g, "flex flex-row overflow-x-auto");
  
  // 2. Fix the buttons container to not wrap
  // <div className="flex flex-wrap justify-end gap-3 w-full sm:w-auto">
  content = content.replace(/flex flex-wrap justify-end gap-3 w-full sm:w-auto/g, "flex flex-row justify-end gap-2 sm:gap-3 shrink-0");
  
  // Also fix loading-slips container which has `flex justify-between items-center mt-6`
  content = content.replace(/flex justify-between items-center mt-6/g, "flex flex-row justify-between items-center mt-6 overflow-x-auto gap-2");
  content = content.replace(/<div className="flex gap-3">/g, '<div className="flex flex-row gap-2 sm:gap-3 shrink-0">');

  // 3. Update the buttons themselves to scale down text and padding on mobile
  // Example button class: "px-6 py-2 bg-[#f3e8ff] text-[#5b21b6] font-medium rounded-lg hover:bg-[#e9d5ff] transition-colors flex items-center gap-2"
  // We want to inject: text-xs sm:text-base px-2 py-1.5 sm:px-6 sm:py-2 whitespace-nowrap
  
  // Replace `px-6 py-2` or `px-6 py-2 ` with `px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap `
  // Let's do it carefully for the bottom action buttons.
  // We can just globally replace `px-6 py-2 ` with `px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap ` in the last 1000 characters of the file.
  
  let endSegment = content.slice(-1500);
  endSegment = endSegment.replace(/px-6 py-2/g, "px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap");
  content = content.slice(0, -1500) + endSegment;

  // Also scale down the text on the left if it's too big
  content = content.replace(/<div className="text-sm text-muted-foreground font-medium">/g, '<div className="text-xs sm:text-sm text-muted-foreground font-medium whitespace-nowrap shrink-0">');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated mobile row in: ${filePath}`);
  }
}

for (const mod of modules) {
  const newPage = path.join(basePath, mod, 'new', 'page.tsx');
  const idDir = path.join(basePath, mod, '[id]');
  const editPage = path.join(idDir, 'page.tsx');

  processFile(newPage);
  processFile(editPage);
}
