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

  // Replace max-w-4xl and max-w-5xl with max-w-6xl
  content = content.replace(/max-w-4xl/g, 'max-w-6xl');
  content = content.replace(/max-w-5xl/g, 'max-w-6xl');
  
  // Replace pb-8 and pb-24 with pb-20
  content = content.replace(/pb-8/g, 'pb-20');
  content = content.replace(/pb-24/g, 'pb-20');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated max width and padding for: ${filePath}`);
  }
}

for (const mod of modules) {
  const newPage = path.join(basePath, mod, 'new', 'page.tsx');
  const idDir = path.join(basePath, mod, '[id]');
  const editPage = path.join(idDir, 'page.tsx');

  processFile(newPage);
  processFile(editPage);
}
