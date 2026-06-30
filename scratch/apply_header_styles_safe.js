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
  'car-conditions'
];

const basePath = path.join(__dirname, '..', 'app', 'user');

function processFile(filePath, modName) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove bottom Cancel buttons.
  // There are a few variants.
  // A. <button type="button" onClick={() => router.push("/user/... ")} className="px-6 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shadow-sm"> Cancel </button>
  // B. <button onClick={() => router.push("/user/... ")} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-200 focus:outline-none"> Cancel </button>

  // We can just find the button block that has `Cancel` and `router.push`.
  // Using a while loop to find all occurrences of Cancel buttons.
  let cancelBtnRegex = /<button[^>]*onClick=\{\(\)\s*=>\s*router\.push\(['"]\/user\/[^'"]+['"]\)\}[^>]*>[\s\n]*Cancel[\s\n]*<\/button>/g;
  content = content.replace(cancelBtnRegex, '');

  // 2. Safely replace the top header.
  // The top header is usually right after `<div className="max-w-4xl mx-auto space-y-6 pb-8">` (or 6xl, etc).
  // It looks like:
  // <div className="flex items-center justify-between mb-6"> (or without mb-6)
  //   <div> (sometimes)
  //     <h1 className="text-2xl font-bold text-foreground">...</h1>
  //   </div> (sometimes)
  // </div>
  // Let's find the h1 line and extract the title.
  
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  if (!h1Match) return;
  const title = h1Match[1].trim();

  // Find the exact block.
  // Start from `<div className="max-w-` or `<div className="max-w-` and go down until `</h1>`. Then find the closing div of the header.
  // Alternatively, just replace the FIRST `<h1 ...>TITLE</h1>` and its containing header div, IF it hasn't been replaced yet.
  
  if (content.includes('bg-white py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20')) {
    // already done
    return;
  }

  // We know the structure is:
  // <div className="flex items-center justify-between...">
  //   <h1 ...>Title</h1>
  // </div>
  // Or:
  // <div className="flex items-center justify-between...">
  //   <div>
  //     <h1 ...>Title</h1>
  //   </div>
  // </div>

  const replacementHeader = `<div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-white py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-black truncate">${title}</h1>
        <button 
          type="button"
          onClick={() => router.push("/user/${modName}")} 
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-100 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          Cancel
        </button>
      </div>`;

  // Manual search and replace to avoid regex issues.
  const lines = content.split('\n');
  let newLines = [];
  let inHeader = false;
  let headerReplaced = false;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!headerReplaced) {
      if (line.includes('<div className="flex items-center justify-between') || line.includes('<div className="flex flex-row items-center justify-between')) {
        // Look ahead to see if it contains the h1 we found
        let containsH1 = false;
        let lookAhead = i;
        while (lookAhead < i + 10 && lookAhead < lines.length) {
          if (lines[lookAhead].includes('<h1')) {
            containsH1 = true;
            break;
          }
          if (lines[lookAhead].includes('</form>')) break; // safety
          lookAhead++;
        }

        if (containsH1) {
          // It's the header div!
          // We need to skip lines until the matching </div> for this header.
          let divDepth = 0;
          let foundDiv = false;
          while (i < lines.length) {
            if (lines[i].includes('<div')) {
              divDepth += (lines[i].match(/<div/g) || []).length;
            }
            if (lines[i].includes('</div')) {
              divDepth -= (lines[i].match(/<\/div/g) || []).length;
            }
            foundDiv = true;
            i++;
            if (foundDiv && divDepth <= 0) {
              break;
            }
          }
          // Now insert the new header
          newLines.push(replacementHeader);
          headerReplaced = true;
          continue;
        }
      } else if (line.includes('<h1') && line.includes(title)) {
        // Some pages might not have the wrapper div. Just the h1 directly under the max-w div.
        // E.g. <div className="max-w-4xl mx-auto space-y-6 pb-8">\n<h1 ...>
        newLines.push(replacementHeader);
        headerReplaced = true;
        i++;
        continue;
      }
    }

    newLines.push(line);
    i++;
  }

  content = newLines.join('\n');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated header and cancel button for: ${filePath}`);
  }
}

for (const mod of modules) {
  const newPage = path.join(basePath, mod, 'new', 'page.tsx');
  const idDir = path.join(basePath, mod, '[id]');
  const editPage = path.join(idDir, 'page.tsx');

  processFile(newPage, mod);
  processFile(editPage, mod);
}
