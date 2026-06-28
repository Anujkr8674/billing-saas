const fs = require('fs');
const path = require('path');
function fixHTMLViewers(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixHTMLViewers(fullPath);
    } else if (file.endsWith('ViewerClient.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/\{\/\*\s*Watermark inside HTML view\s*\*\/\}\s*<div[^>]*>[\s\S]*?<\/div>\s*<\/div>/g, '');
      fs.writeFileSync(fullPath, content);
    }
  }
}
fixHTMLViewers(path.join(__dirname, 'app', 'user'));
console.log('Fixed HTML watermarks');
