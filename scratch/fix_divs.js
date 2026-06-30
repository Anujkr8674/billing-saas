const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, '..', 'app', 'user', 'lorry-receipts', '[id]', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'lorry-receipts', 'new', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'money-receipts', '[id]', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'money-receipts', 'new', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'noc-forms', '[id]', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'noc-forms', 'new', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'packing-lists', '[id]', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'packing-lists', 'new', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'payment-vouchers', 'new', 'page.tsx'),
  path.join(__dirname, '..', 'app', 'user', 'payment-vouchers', '[id]', 'page.tsx')
];

for (const filePath of filesToFix) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Lorry receipts and packing lists usually end with:
  //       </div>
  // 
  //       </form>
  //     </div>
  //   );
  // }
  if (content.match(/<\/div>\s*<\/form>\s*<\/div>\s*\);\s*}/)) {
    content = content.replace(/<\/div>\s*<\/form>\s*<\/div>\s*\);\s*}/, '</div>\n</div>\n\n      </form>\n    </div>\n  );\n}');
  }
  
  // Money receipts and payment vouchers (sometimes) end with:
  //       </div>
  //     </div>
  //   );
  // }
  else if (content.match(/<\/div>\s*<\/div>\s*\);\s*}/)) {
    content = content.replace(/<\/div>\s*<\/div>\s*\);\s*}/, '</div>\n</div>\n</div>\n  );\n}');
  }
  
  // Noc forms end with:
  //       </div>
  // 
  //     </div>
  //   );
  // }
  else if (content.match(/<\/div>\s*<\/div>\s*\);\s*}/)) {
     // same as above
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed div in: ${filePath}`);
  }
}
