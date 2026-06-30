const fs = require('fs');
const path = require('path');

const modules = [
  'noc-forms'
];

const basePath = path.join(__dirname, '..', 'app', 'user');

function processFile(filePath, modName) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove bottom Cancel buttons.
  let cancelBtnRegex = /<button[^>]*onClick=\{\(\)\s*=>\s*router\.push\(['"]\/user\/[^'"]+['"]\)\}[^>]*>[\s\n]*Cancel[\s\n]*<\/button>/g;
  content = content.replace(cancelBtnRegex, '');

  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  if (!h1Match) return;
  const title = h1Match[1].trim();
  
  if (content.includes('bg-white py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20')) {
    // already done
    return;
  }

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

  const lines = content.split('\n');
  let newLines = [];
  let inHeader = false;
  let headerReplaced = false;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!headerReplaced) {
      if (line.includes('<div className="flex items-center justify-between') || line.includes('<div className="flex flex-row items-center justify-between')) {
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
          newLines.push(replacementHeader);
          headerReplaced = true;
          continue;
        }
      } else if (line.includes('<h1') && line.includes(title)) {
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
