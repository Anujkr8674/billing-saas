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
  const listFile = path.join(__dirname, '..', 'app/user', mod, 'page.tsx');
  if (fs.existsSync(listFile)) {
    let content = fs.readFileSync(listFile, 'utf-8');
    let originalContent = content;

    // 1. Fix the container div
    // It might be 'flex-col sm:flex-row' or 'flex-row' depending on if previous script ran
    content = content.replace(
      /<div className="flex flex-(col|row)[^>]+justify-between[^>]+">/g,
      `<div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-white py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20 mb-4 sm:mb-6">`
    );

    // 2. Fix the h1 text size and add truncate
    content = content.replace(
      /<h1 className="text-2xl font-bold text-(black|foreground)">/g,
      `<h1 className="text-lg sm:text-2xl font-bold text-black truncate">`
    );

    // 3. Hide the subtitle on mobile to ensure space, and make it smaller
    content = content.replace(
      /<p className="text-muted-foreground text-sm">/g,
      `<p className="text-muted-foreground text-xs sm:text-sm truncate hidden sm:block">`
    );

    // 4. Make the Create button smaller on mobile
    // It usually looks like `className="flex items-center gap-2 bg-[#5b21b6] text-white px-4 py-2 rounded-lg hover:bg-[#5b21b6]/90 transition-colors shadow-sm font-medium w-fit"`
    // Or for other modules it might use `bg-primary` instead of `bg-[#5b21b6]`
    content = content.replace(
      /px-4 py-2 rounded-lg/g,
      `px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base`
    );

    if (content !== originalContent) {
      fs.writeFileSync(listFile, content, 'utf-8');
      console.log(`Updated list page responsive header: ${mod}`);
    }
  }
});
