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

  // 1. List Pages (Responsive Headers)
  const listFile = path.join(modDir, 'page.tsx');
  if (fs.existsSync(listFile)) {
    let content = fs.readFileSync(listFile, 'utf-8');
    
    // Header flex container
    content = content.replace(
      /<div className="flex flex-(col|row)[^>]+justify-between[^>]*">/g,
      `<div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-white py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20 mb-4 sm:mb-6">`
    );
    // h1 text size and truncate
    content = content.replace(
      /<h1 className="text-2xl font-bold text-(black|foreground)">/g,
      `<h1 className="text-lg sm:text-2xl font-bold text-black truncate">`
    );
    // subtitle
    content = content.replace(
      /<p className="text-muted-foreground text-sm">/g,
      `<p className="text-muted-foreground text-xs sm:text-sm truncate hidden sm:block">`
    );
    // Create button
    content = content.replace(
      /px-4 py-2 rounded-lg/g,
      `px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base`
    );
    fs.writeFileSync(listFile, content, 'utf-8');
  }

  // 2. Create Pages (White Header + Cancel Button + Remove Bottom Cancel)
  const createFile = path.join(modDir, 'new/page.tsx');
  if (fs.existsSync(createFile)) {
    let content = fs.readFileSync(createFile, 'utf-8');
    
    // Remove bottom cancel
    content = content.replace(/<button[^>]*>Cancel<\/button>/g, '');
    content = content.replace(/<button[^>]*>\s*Cancel\s*<\/button>/gi, '');
    
    // Some already have the Cancel button in the header (Quotations/Invoices), some don't.
    // Replace the entire top div block:
    content = content.replace(
      /<div className="flex items-center justify-between[^>]*>\s*(?:<div>\s*)?<h1 className="text-2xl font-bold text-black">(Create [^<]+)<\/h1>\s*(?:<\/div>\s*)?(?:<button[^>]*>Cancel<\/button>\s*)?<\/div>/g,
      `<div className="flex items-center justify-between mb-6 bg-white py-2 px-4 rounded-lg shadow-sm border border-primary/20">
        <div>
          <h1 className="text-2xl font-bold text-black">$1</h1>
        </div>
        <button 
          type="button"
          onClick={() => router.push("/user/${mod}")} 
          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-200 focus:outline-none"
        >
          Cancel
        </button>
      </div>`
    );
    fs.writeFileSync(createFile, content, 'utf-8');
  }

  // 3. View Pages (Responsive Dropdown, PDF Width, Watermark)
  const viewDir = path.join(modDir, '[id]/view');
  if (fs.existsSync(viewDir)) {
    const viewFiles = fs.readdirSync(viewDir).filter(f => f.endsWith('.tsx'));
    viewFiles.forEach(viewFile => {
      let content = fs.readFileSync(path.join(viewDir, viewFile), 'utf-8');
      
      // A. Watermark
      content = content.replace(/\{profile\?\.hasWatermark !== false && \(/g, `{false && profile?.hasWatermark !== false && (`);
      content = content.replace(/\{hasWatermark && \(/g, `{false && hasWatermark && (`);

      // B. PDF Width
      content = content.replace(/className="max-w-5xl mx-auto bg-white/g, `className="min-w-[800px] md:min-w-0 max-w-5xl mx-auto bg-white`);
      content = content.replace(/min-w-\[800px\] md:min-w-0 min-w-\[800px\] md:min-w-0/g, `min-w-[800px] md:min-w-0`);

      // C. Action Dropdown
      // We know exactly what the original looks like.
      // E.g. <div className="flex flex-nowrap whitespace-nowrap items-center gap-4 print:hidden overflow-x-auto custom-scrollbar pb-1">
      // OR <div className="flex items-center gap-2 print:hidden whitespace-nowrap">
      // The wrapper div is followed by a <Link> then <button>s. We can match from the opening div down to `</div>\n      </div>`
      
      // Let's use a very safe regex that matches the header div block ending exactly at the closing of the header container.
      const actionHeaderRegex = /<div className="flex (?:flex-nowrap whitespace-nowrap )?items-center gap-[24] print:hidden[^>]*>([\s\S]*?)(?:\s*)<\/div>\s*<\/div>\s*(?:\{\/\* HTML|\{\/\* Main HTML|<div className="flex-1)/g;
      
      content = content.replace(actionHeaderRegex, (match, innerContent) => {
        if (innerContent.includes('isActionMenuOpen')) return match;

        const linkMatch = innerContent.match(/(<Link href=[\s\S]*?<\/Link>)/);
        const buttonsMatch = innerContent.match(/<button[\s\S]*?<\/button>|<Link[\s\S]*?<Edit[\s\S]*?<\/Link>/g);
        
        if (linkMatch && buttonsMatch) {
          const link = linkMatch[1];
          const actionButtons = buttonsMatch.filter(b => !b.includes('Back'));
          const buttonsString = actionButtons.join('\n            ');

          return `<div className="flex items-center gap-4 print:hidden">
          ${link}
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            ${buttonsString}
          </div>

          {/* Mobile Actions Dropdown */}
          <div className="md:hidden relative">
            <button 
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} 
              className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {isActionMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsActionMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 flex flex-col p-2 gap-2">
                  ${buttonsString}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* HTML Document View */}
      <div className="flex-1`;
        }
        return match;
      });

      // We need to add the MoreVertical icon and isActionMenuOpen state
      if (content.includes('MoreVertical') && !content.includes('import { MoreVertical')) {
        content = content.replace(/import \{([^}]+)\} from "lucide-react";/, (m, p1) => {
          if (!p1.includes('MoreVertical')) return `import { ${p1}, MoreVertical } from "lucide-react";`;
          return m;
        });
      }
      
      if (content.includes('isActionMenuOpen') && !content.includes('const [isActionMenuOpen, setIsActionMenuOpen]')) {
        content = content.replace(/const \[downloading, setDownloading\] = useState\(false\);/, `const [downloading, setDownloading] = useState(false);\n  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);`);
      }

      fs.writeFileSync(path.join(viewDir, viewFile), content, 'utf-8');
    });
  }
});
