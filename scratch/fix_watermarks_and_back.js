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
  'noc-forms'
];

modules.forEach(mod => {
  const modDir = path.join(__dirname, '..', 'app/user', mod);
  if (!fs.existsSync(modDir)) return;

  const viewDir = path.join(modDir, '[id]/view');
  if (fs.existsSync(viewDir)) {
    const viewFiles = fs.readdirSync(viewDir).filter(f => f.endsWith('.tsx'));
    viewFiles.forEach(viewFile => {
      const filePath = path.join(viewDir, viewFile);
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // 1. Hide the opacity-[0.03] watermarks
      const watermarkRegex = /(<div className="absolute inset-0 flex items-center justify-center opacity-\[0\.03\][^>]*>[\s\S]*?<\/div>)/g;
      content = content.replace(watermarkRegex, (match) => {
        // Only wrap it if it's not already wrapped
        if (content.includes(`{false && (\n          ${match}\n        )}`)) {
          return match;
        }
        return `{false && (\n          ${match}\n        )}`;
      });

      // 2. Hide opacity-15 watermarks that we might have missed
      const opacity15Regex = /(<div className="text-\[5rem\] md:text-\[7rem\] font-bold text-gray-400 opacity-15[^>]*>[\s\S]*?<\/div>)/g;
      content = content.replace(opacity15Regex, (match) => {
        if (content.includes(`{false && (\n              ${match}\n            )}`)) {
          return match;
        }
        return `{false && (\n              ${match}\n            )}`;
      });

      // 3. Make "Back to [Module]" responsive
      // Matches `<ArrowLeft className="..." /> Back to Surveys` or similar
      const backRegex = /(<ArrowLeft[^>]*>\s*)(Back to [a-zA-Z\s]+)(?=<\/Link>|<\/button>|<)/g;
      content = content.replace(backRegex, (match, arrow, text) => {
        // If it already has the responsive spans, skip
        if (match.includes('sm:inline')) return match;
        return `${arrow}<span className="hidden sm:inline">${text.trim()}</span><span className="sm:hidden">Back</span>`;
      });
      
      // We also need to fix the Link wrapper class to have smaller gap on mobile, like we did for Lorry Receipts earlier
      // <Link href="/user/payment-vouchers" className="text-[#5b21b6] hover:underline flex items-center gap-2 font-medium text-sm mr-4">
      const linkRegex = /<Link ([^>]+) className="([^"]*gap-2[^"]*mr-4[^"]*)"/g;
      content = content.replace(linkRegex, (match, attrs, classes) => {
        if (classes.includes('sm:gap-2')) return match; // already fixed
        let newClasses = classes.replace('gap-2', 'gap-1 sm:gap-2');
        newClasses = newClasses.replace('mr-4', 'mr-2 sm:mr-4');
        return `<Link ${attrs} className="${newClasses}"`;
      });

      fs.writeFileSync(filePath, content, 'utf-8');
    });
  }
});
