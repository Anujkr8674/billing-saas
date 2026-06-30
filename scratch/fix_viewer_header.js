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

const newContainer = `<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white py-3 px-4 rounded-xl shadow-sm border border-[#5b21b6]/20 mb-6 shrink-0 print:hidden overflow-x-auto">`;

for (const mod of modules) {
  const viewDir = path.join(basePath, mod, '[id]', 'view');
  if (!fs.existsSync(viewDir)) continue;

  const files = fs.readdirSync(viewDir);
  for (const file of files) {
    if (file.endsWith('ViewerClient.tsx')) {
      const filePath = path.join(viewDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace the main header container
      const regex = /<div className="flex items-center justify-between mb-4 shrink-0 px-2 print:hidden.*?">/;
      if (content.match(regex)) {
        content = content.replace(regex, newContainer);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated header in: ${filePath}`);
      } else {
        console.log(`No match in: ${filePath}`);
      }
    }
  }
}
