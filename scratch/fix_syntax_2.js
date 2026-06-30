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
  'bilty'
];

const basePath = path.join(__dirname, '..', 'app', 'user');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We need to restore the closing </div> for the main wrapper.
  // The end of the file looks like:
  //       </div>
  //   );
  // }
  
  // Let's replace `</div>\n  );\n}` or `</div>\n    );\n}` with `</div>\n    </div>\n  );\n}`
  // But ONLY if the file actually has the syntax error (missing one closing div).
  // Actually, we can just look for the pattern:
  // /<\/div>[\s\n]*\);[\s\n]*\}/
  
  // Wait, if it has 2 `</div>` already, we shouldn't add another one.
  // Let's just blindly add it if it ends with `</div>\n  );\n}` and NOT `</div>\n    </div>\n  );\n}`
  
  const endPattern2 = /<\/div>[\s\n]*<\/div>[\s\n]*\);[\s\n]*\}/;
  const endPattern1 = /<\/div>[\s\n]*\);[\s\n]*\}/;

  if (!endPattern2.test(content) && endPattern1.test(content)) {
    content = content.replace(endPattern1, '</div>\n    </div>\n  );\n}');
  }

  // There was also an issue with `surveys/[id]/page.tsx` and `surveys/new/page.tsx`:
  // My first script removed `</div>` before `<form ...` in surveys because of the greedy/lazy regex.
  // Wait, I fixed it in `fix_syntax.js` by removing a duplicate.
  // Let's check `surveys/new/page.tsx` errors:
  // app/user/surveys/new/page.tsx(252,10): error TS17008: JSX element 'div' has no corresponding closing tag.
  // This means it is still missing a </div> at the end. The above fix should fix it.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed end div in: ${filePath}`);
  }
}

for (const mod of modules) {
  const newPage = path.join(basePath, mod, 'new', 'page.tsx');
  const idDir = path.join(basePath, mod, '[id]');
  const editPage = path.join(idDir, 'page.tsx');

  fixFile(newPage);
  fixFile(editPage);
}

console.log("Done fixing end divs.");
