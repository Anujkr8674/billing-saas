const fs = require('fs');
const files = [
  'd:/Nextgen/billing-software/lib/packinglist-pdf-generator.ts',
  'd:/Nextgen/billing-software/app/actions/email.ts',
  'd:/Nextgen/billing-software/app/user/packing-lists/[id]/view/HTMLPackingListViewerClient.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(f, content);
  console.log('Fixed', f);
});
