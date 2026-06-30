const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, '..', 'app', 'user', 'vehicle-conditions', '[id]', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'vehicle-conditions', 'new', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'quotations', '[id]', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'quotations', 'new', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'invoices', 'new', 'page.tsx')
];

for (const filePath of filesToFix) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Pattern 1: Vehicle conditions
    content = content.replace(
      /className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card border-t border-border p-4 flex items-center justify-end gap-4 z-40 shadow-\[0_-4px_6px_-1px_rgba\(0,0,0,0\.05\)\]"/g,
      'className="mt-8 bg-card border border-border rounded-lg p-4 flex items-center justify-end gap-4 shadow-sm"'
    );

    // Pattern 2: Quotations & Invoices
    content = content.replace(
      /className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card border-t border-border p-4 shadow-lg z-40 flex items-center justify-end gap-4"/g,
      'className="mt-8 bg-card border border-border rounded-lg p-4 flex items-center justify-end gap-4 shadow-sm"'
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed sticky bottom buttons in: ${filePath}`);
    }
  }
}
