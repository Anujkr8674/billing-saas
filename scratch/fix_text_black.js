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

let count = 0;
files.forEach(file => {
  if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace text-black with text-foreground in the header h1 tags
  content = content.replace(/<h1 className="([^"]*)text-black([^"]*)">/g, '<h1 className="$1text-foreground$2">');
  
  // also handle cases where it might be in an inner div of the header
  content = content.replace(/text-lg sm:text-2xl font-bold text-black/g, 'text-lg sm:text-2xl font-bold text-foreground');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed text color in:', file);
    count++;
  }
});
console.log(`Updated ${count} files.`);
