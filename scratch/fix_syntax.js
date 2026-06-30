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
  'car-conditions',
  'bilty' // if it exists
];

const basePath = path.join(__dirname, '..', 'app', 'user');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // The floating </div> is usually immediately preceding the <form> element.
  // We can look for:
  //       </div>
  //       </div>
  //       <form
  
  content = content.replace(/<\/div>[\s\n]*<\/div>[\s\n]*<form/g, '</div>\n\n      <form');

  // For some pages it might not be a <form>, maybe it's something else like a div?
  // Let's check for `</button>\n      </div>\n        \n      </div>`
  content = content.replace(/<\/button>[\s\n]*<\/div>[\s\n]*<\/div>/g, '</button>\n      </div>');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed syntax in: ${filePath}`);
  }
}

for (const mod of modules) {
  const newPage = path.join(basePath, mod, 'new', 'page.tsx');
  const idDir = path.join(basePath, mod, '[id]');
  const editPage = path.join(idDir, 'page.tsx');

  processFile(newPage);
  processFile(editPage);
}

console.log("Done syntax fix.");
