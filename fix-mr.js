const fs = require('fs');

const files = [
  'd:/Nextgen/billing-software/app/user/money-receipts/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
