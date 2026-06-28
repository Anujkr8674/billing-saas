const fs = require('fs');
const path = require('path');
const userDir = path.join(__dirname, 'app', 'user');

function fixHTMLViewers(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixHTMLViewers(fullPath);
    } else if (file.endsWith('ViewerClient.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/className="flex flex-wrap items-center gap-4 print:hidden"/g, 'className="flex flex-nowrap whitespace-nowrap items-center gap-4 print:hidden overflow-x-auto custom-scrollbar pb-1"');
      fs.writeFileSync(fullPath, content);
    }
  }
}
fixHTMLViewers(userDir);
console.log('Fixed flex wrap in HTML Viewers');
