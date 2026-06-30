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

for (const mod of modules) {
  const viewDir = path.join(basePath, mod, '[id]', 'view');
  if (!fs.existsSync(viewDir)) continue;

  const files = fs.readdirSync(viewDir);
  for (const file of files) {
    if (file.endsWith('ViewerClient.tsx')) {
      const filePath = path.join(viewDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      let originalContent = content;
      
      // 1. Outer container
      content = content.replace(
        /flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white py-3 px-4/g,
        'flex flex-row items-center justify-between gap-2 sm:gap-4 bg-white py-2 sm:py-3 px-3 sm:px-4'
      );
      
      // 2. h1 styling
      content = content.replace(
        /text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2/g,
        'text-sm sm:text-2xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2 truncate whitespace-nowrap'
      );

      // 3. FileText icon inside h1 (or whatever icon)
      // Usually it's <FileText className="w-6 h-6 text-[#5b21b6]" />
      content = content.replace(
        /className="w-6 h-6 text-\[\#5b21b6\]"/g,
        'className="w-4 h-4 sm:w-6 sm:h-6 shrink-0 text-[#5b21b6]"'
      );

      // 4. Action container
      content = content.replace(
        /<div className="flex items-center gap-4 print:hidden">/g,
        '<div className="flex items-center gap-2 sm:gap-4 print:hidden shrink-0">'
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated mobile view header in: ${filePath}`);
      }
    }
  }
}
