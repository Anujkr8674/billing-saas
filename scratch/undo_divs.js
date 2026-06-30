const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, '..', 'app', 'user', 'money-receipts', 'new', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'payment-vouchers', 'new', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'payment-vouchers', '[id]', 'page.tsx')
];

for (const filePath of filesToFix) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace </div></div></div>); with </div></div>);
  if (content.match(/<\/div>\n<\/div>\n<\/div>\n  \);\n}/)) {
    content = content.replace(/<\/div>\n<\/div>\n<\/div>\n  \);\n}/, '</div>\n</div>\n  );\n}');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Undid extra div in: ${filePath}`);
  }
}
