const fs = require('fs');
const glob = require('glob');

const files = [
  'd:/Nextgen/billing-software/app/user/lorry-receipts/[id]/page.tsx',
  'd:/Nextgen/billing-software/app/user/packing-lists/[id]/page.tsx',
  'd:/Nextgen/billing-software/app/user/lorry-receipts/[id]/view/HTMLLorryReceiptViewerClient.tsx',
  'd:/Nextgen/billing-software/app/user/packing-lists/[id]/view/HTMLPackingListViewerClient.tsx',
  'd:/Nextgen/billing-software/lib/lorryreceipt-pdf-generator.ts',
  'd:/Nextgen/billing-software/lib/packinglist-pdf-generator.ts'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/const d = data\.details/g, 'const d: any = data.details');
    content = content.replace(/const d = lorryReceipt\.details/g, 'const d: any = lorryReceipt.details');
    content = content.replace(/const d = packingList\.details/g, 'const d: any = packingList.details');
    fs.writeFileSync(f, content);
    console.log('Fixed types in', f);
  }
});
