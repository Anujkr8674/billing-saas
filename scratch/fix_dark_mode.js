const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
};

const appDir = path.join(__dirname, '..', 'app', 'user');
const files = walkSync(appDir);

files.forEach(file => {
  if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace bg-white with bg-card in these specific header classes
  // 1. Viewer headers & module index headers
  content = content.replace(/bg-white py-2 px-3/g, 'bg-card py-2 px-3');
  content = content.replace(/bg-white py-2 sm:py-3 px-3 sm:px-4/g, 'bg-card py-2 sm:py-3 px-3 sm:px-4');
  
  // 2. Dashboard overview and profile settings headers
  content = content.replace(/bg-white py-3 px-4/g, 'bg-card py-3 px-4');
  content = content.replace(/bg-white border border-\[\#5b21b6\]\/20 rounded-xl overflow-hidden py-3 px-4 shadow-sm flex items-center/g, 'bg-card border border-[#5b21b6]/20 rounded-xl overflow-hidden py-3 px-4 shadow-sm flex items-center');

  // Fix text-black back to text-foreground for the marquee
  if (file.includes(path.join('user', 'page.tsx'))) {
    content = content.replace(/text-black whitespace-nowrap/g, 'text-foreground whitespace-nowrap');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed dark mode in:', file);
  }
});
