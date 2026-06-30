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

const basePath = path.join(__dirname, '..', 'app', 'user');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const hasFields = content.includes('const { fields') || content.includes('const {fields') || content.includes('watchedItems.length');
  const countContent = hasFields ? 
    `Items: <span className="text-foreground">{fields?.length || 0}</span>` : 
    `<span className="text-muted-foreground/60">Ready to save</span>`;

  // Fix for Quotations & Invoices & Vehicle conditions where buttons are direct children
  // <div className="mt-8 bg-card border border-border rounded-lg p-4 flex items-center justify-end gap-4 shadow-sm">
  const directChildrenMatch = content.match(/<div className="mt-8 bg-card border border-border rounded-lg p-4 flex items-center justify-end gap-4 shadow-sm">([\s\S]*?)<\/div>/);
  if (directChildrenMatch) {
    const buttons = directChildrenMatch[1].trim();
    if (!buttons.includes('<div className="flex gap-3">') && buttons.includes('<button')) {
      const newBlock = `<div className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-muted-foreground font-medium">
          ${countContent}
        </div>
        <div className="flex flex-wrap justify-end gap-3 w-full sm:w-auto">
          ${buttons}
        </div>
      </div>`;
      content = content.replace(directChildrenMatch[0], newBlock);
    }
  }

  // Fix for NOC Forms where it's already justify-between but no left side
  // <div className="mt-8 bg-card border border-border rounded-lg p-4 px-8 flex justify-between items-center shadow-sm">
  const nocMatch = content.match(/<div className="mt-8 bg-card border border-border rounded-lg p-4 px-8 flex justify-between items-center shadow-sm">([\s\S]*?)<\/div>\s*<\/div>/);
  if (nocMatch) {
    let inner = nocMatch[1].trim();
    if (inner.startsWith('<div className="flex gap-3">')) {
      const newBlock = `<div className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-muted-foreground font-medium">
          ${countContent}
        </div>
        <div className="flex flex-wrap justify-end gap-3 w-full sm:w-auto">
          ${inner.substring('<div className="flex gap-3">'.length)}
      </div>`;
      content = content.replace(nocMatch[0], newBlock);
    }
  }

  // Fix for packing lists where it has justify-end
  // <div className="bg-card p-4 border border-border rounded-xl shadow-sm flex justify-end items-center mt-6">
  const packingMatch = content.match(/<div className="bg-card p-4 border border-border rounded-xl shadow-sm flex justify-end items-center mt-6">([\s\S]*?)<\/div>\s*<\/div>/);
  if (packingMatch) {
    let inner = packingMatch[1].trim();
    if (inner.startsWith('<div className="flex gap-3">')) {
      const newBlock = `<div className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-muted-foreground font-medium">
          ${countContent}
        </div>
        <div className="flex flex-wrap justify-end gap-3 w-full sm:w-auto">
          ${inner.substring('<div className="flex gap-3">'.length)}
      </div>`;
      content = content.replace(packingMatch[0], newBlock);
    }
  }

  // Fix for payment-vouchers and money-receipts
  // <div className="flex justify-end gap-4 mt-8 bg-white p-4 rounded-lg shadow-sm border border-primary/20">
  const paymentMatch = content.match(/<div className="flex justify-end gap-4 mt-8 bg-white p-4 rounded-lg shadow-sm border border-primary\/20">([\s\S]*?)<\/div>/);
  if (paymentMatch) {
    const buttons = paymentMatch[1].trim();
    const newBlock = `<div className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-muted-foreground font-medium">
          ${countContent}
        </div>
        <div className="flex flex-wrap justify-end gap-3 w-full sm:w-auto">
          ${buttons}
        </div>
      </div>`;
    content = content.replace(paymentMatch[0], newBlock);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated bottom bar in: ${filePath}`);
  }
}

for (const mod of modules) {
  const newPage = path.join(basePath, mod, 'new', 'page.tsx');
  const idDir = path.join(basePath, mod, '[id]');
  const editPage = path.join(idDir, 'page.tsx');

  processFile(newPage);
  processFile(editPage);
}
