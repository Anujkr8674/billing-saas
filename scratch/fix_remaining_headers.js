const fs = require('fs');
const path = require('path');

const files = [
  'app/user/quotations/new/page.tsx',
  'app/user/invoices/new/page.tsx',
  'app/user/vehicle-conditions/new/page.tsx'
].map(f => path.join(__dirname, '..', f));

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // Since they already have the Cancel button, we just need to replace the flex container
  content = content.replace(
    /<div className="flex items-center justify-between">/g,
    `<div className="flex items-center justify-between mb-6 bg-white py-2 px-4 rounded-lg shadow-sm border border-primary/20">`
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Patched header for: ${path.basename(file)}`);
  }
});
