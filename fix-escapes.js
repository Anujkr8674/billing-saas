const fs = require('fs');

const files = [
  'd:/Nextgen/billing-software/app/user/payment-vouchers/new/page.tsx',
  'd:/Nextgen/billing-software/app/user/payment-vouchers/[id]/page.tsx',
  'd:/Nextgen/billing-software/app/user/payment-vouchers/[id]/view/HTMLPaymentVoucherViewerClient.tsx',
  'd:/Nextgen/billing-software/lib/paymentvoucher-pdf-generator.ts',
  'd:/Nextgen/billing-software/app/actions/email.ts'
];

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Fix escaped backticks
    content = content.replace(/\\`/g, '`');
    // Fix escaped dollar signs
    content = content.replace(/\\\$/g, '$');
    
    // Specifically fix HTMLPaymentVoucherViewerClient.tsx escaped newlines if they are literal `\n`
    if (file.includes('HTMLPaymentVoucherViewerClient.tsx')) {
       content = content.replace(/\\\\n/g, '\\n');
    }

    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
    }
  } catch(e) {
    console.error('Error on', file, e.message);
  }
}
