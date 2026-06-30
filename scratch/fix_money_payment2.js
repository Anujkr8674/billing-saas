const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..', 'app', 'user');

const newContainer = `<div className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-muted-foreground font-medium">
          <span className="text-muted-foreground/60">Ready to save</span>
        </div>
        <div className="flex flex-wrap justify-end gap-3 w-full sm:w-auto">`;

for (const p of ['money-receipts/[id]/page.tsx', 'payment-vouchers/[id]/page.tsx']) {
  const filePath = path.join(basePath, p);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace:
    // <div className="mt-8 bg-card border border-border rounded-lg p-4 px-8 flex justify-end items-center shadow-sm">
    //   <div className="flex gap-4">
    // or gap-3 or whatever
    const match = content.match(/<div className="mt-8 bg-card border border-border rounded-lg p-4 (px-8 )?flex justify-end items-center shadow-sm">\s*<div className="flex gap-\d">/);
    if (match) {
      content = content.replace(match[0], newContainer);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${p}`);
    } else {
      console.log(`Still no match in ${p}`);
    }
  }
}
