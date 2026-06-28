const fs = require('fs');

const files = [
  'd:/Nextgen/billing-software/lib/loadingslip-pdf-generator.ts',
  'd:/Nextgen/billing-software/lib/pdf-generator.ts',
  'd:/Nextgen/billing-software/lib/survey-pdf-generator.ts'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/doc\.internal\.getNumberOfPages\(\)/g, '(doc as any).internal.getNumberOfPages()');
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  }
});
