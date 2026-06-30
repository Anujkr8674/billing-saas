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
  'car-conditions',
  'bilty' // if it exists
];

const basePath = path.join(__dirname, '..', 'app', 'user');

function processFile(filePath, moduleName) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove the existing Cancel button at the bottom.
  // It usually looks like <button type="button" onClick={() => router.push("/user/MODULE")} ...> Cancel </button>
  // We'll use a regex that matches the button containing "Cancel" and router.push
  const cancelBtnRegex = /<button[^>]*onClick=\{\(\)\s*=>\s*router\.push\(['"]\/user\/[^'"]+['"]\)\}[^>]*>[\s\n]*Cancel[\s\n]*<\/button>/g;
  content = content.replace(cancelBtnRegex, '');

  // 2. Replace the top header
  // Find something like:
  // <div className="flex items-center justify-between[^"]*">
  //   <h1 className="text-2xl font-bold text-foreground">TITLE</h1>
  //   (maybe a cancel button)
  // </div>
  // Or:
  // <div className="flex items-center justify-between">
  //   <h1 className="text-2xl font-bold text-foreground">TITLE</h1>
  // </div>
  // Or:
  // <div>
  //   <h1 className="text-2xl font-bold text-foreground">TITLE</h1>
  // </div>

  // Let's first extract the TITLE.
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  if (!h1Match) return;
  const title = h1Match[1].trim();

  // Now, replace the entire div block that contains this h1.
  // A safer regex: find the block from <div className="max-w-4xl (or 6xl) ... pb-8"> or just the first child of the return statement.
  // Actually, we can just replace the specific header div.
  
  const headerBlockRegex1 = /<div className="flex items-center justify-between[^>]*>[\s\S]*?<h1[^>]*>[^<]+<\/h1>[\s\S]*?<\/div>/;
  const headerBlockRegex2 = /<div>[\s\n]*<h1[^>]*>[^<]+<\/h1>[\s\n]*<\/div>/;
  const headerBlockRegex3 = /<div className="flex flex-row items-center justify-between[^>]*>[\s\S]*?<h1[^>]*>[^<]+<\/h1>[\s\S]*?<\/div>/;

  const replacement = `<div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-white py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-black truncate">${title}</h1>
        <button 
          type="button"
          onClick={() => router.push("/user/${moduleName}")} 
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-100 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          Cancel
        </button>
      </div>`;

  if (headerBlockRegex3.test(content) && content.includes('bg-red-50 text-red-600')) {
    // Already updated with my new style
    console.log(`Already updated: ${filePath}`);
    return;
  } else if (headerBlockRegex1.test(content)) {
    content = content.replace(headerBlockRegex1, replacement);
  } else if (headerBlockRegex2.test(content)) {
    content = content.replace(headerBlockRegex2, replacement);
  } else {
    // Sometimes the h1 doesn't have a wrapper div if it's the first child.
    const h1OnlyRegex = /<h1[^>]*>[^<]+<\/h1>/;
    content = content.replace(h1OnlyRegex, replacement);
  }

  // Also remove old Cancel buttons that were inside the headerBlock if any got left behind (the replacement overwrites the whole header block so we're good).

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

for (const mod of modules) {
  const newPage = path.join(basePath, mod, 'new', 'page.tsx');
  const idDir = path.join(basePath, mod, '[id]');
  const editPage = path.join(idDir, 'page.tsx');

  processFile(newPage, mod);
  processFile(editPage, mod);
}

console.log("Done.");
