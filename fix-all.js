const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walkDir('d:/Nextgen/billing-software/app/user');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  if (content.includes('...data.details')) {
    content = content.replace(/\.\.\.data\.details/g, '...(data.details as any)');
    changed = true;
  }
  
  if (content.includes('setClientName(data.clientName)')) {
    content = content.replace(/setClientName\(data\.clientName\)/g, 'setClientName(data.clientName || "")');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  }
});
