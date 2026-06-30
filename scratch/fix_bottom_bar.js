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

  // Find if it has fields
  const hasFields = content.includes('const { fields') || content.includes('const {fields');

  // We want to find the bottom action bar. It usually comes right before </form> or after </form> at the end.
  // There are a few variants:
  // 1. <div className="mt-8 bg-card border border-border rounded-lg p-4 flex items-center justify-end gap-4 shadow-sm">
  // 2. <div className="mt-8 bg-card border border-border rounded-lg p-4 px-8 flex justify-between items-center shadow-sm">
  // 3. <div className="bg-card p-4 border border-border rounded-xl shadow-sm flex justify-end items-center mt-6">
  // 4. <div className="flex flex-row items-center justify-end gap-2 sm:gap-4 ... (maybe not)

  const patterns = [
    /className="mt-8 bg-card border border-border rounded-lg p-4 flex items-center justify-end gap-4 shadow-sm"/g,
    /className="mt-8 bg-card border border-border rounded-lg p-4 px-8 flex justify-between items-center shadow-sm"/g,
    /className="bg-card p-4 border border-border rounded-xl shadow-sm flex justify-end items-center mt-6"/g,
    /className="mt-8 bg-card border border-border rounded-lg p-4 flex items-center justify-end gap-4 shadow-sm"/g,
    /className="fixed bottom-0 [^"]*"/g // just in case any are left
  ];

  const standardContainerClass = 'className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center mt-6"';

  let replacedContainer = false;
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, standardContainerClass);
      replacedContainer = true;
    }
  }

  // If replaced, we need to ensure the left side info is present.
  // Wait, the structure is usually:
  // <div className="...">
  //   <button ...>
  //   <button ...>
  // </div>
  // OR
  // <div className="...">
  //   <div className="flex gap-3">
  //     <button ...>
  //     <button ...>
  //   </div>
  // </div>

  // We should just use a regex to wrap the buttons in a right-aligned div if they aren't, and add the left side div.
  // Actually, doing this with regex is brittle if there are multiple divs.

}

// I will re-write this script to be more robust
