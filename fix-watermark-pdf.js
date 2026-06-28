const fs = require('fs');
const path = require('path');
const libDir = path.join(__dirname, 'lib');
const pdfFiles = fs.readdirSync(libDir).filter(f => f.includes('pdf-generator'));
for (const file of pdfFiles) {
  const fullPath = path.join(libDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(/\/\/\s*Watermark[\s\S]*?doc\.restoreGraphicsState\(\);/g, '');
  fs.writeFileSync(fullPath, content);
}
console.log('Fixed PDF watermarks');
