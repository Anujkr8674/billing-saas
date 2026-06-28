const fs = require('fs');
const path = require('path');

const d = path.join(__dirname, '../app/user');
const files = fs.readdirSync(d);

files.forEach(f => {
  const p = path.join(d, f, 'page.tsx');
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    
    // The duplicate block looks exactly like:
    // <Link href={`/user/surveys/${item.id}`} className="text-muted-foreground hover:text-foreground transition-colors" title="Edit">
    //   <Edit className="w-5 h-5" />
    // </Link>
    
    // We can just find all instances of <Link href={`/user/f/${item.id}`}... and remove duplicates if they are back to back.
    // An easier way is just splitting by the Link block.
    
    const regex = /(<Link href=\{`\/user\/[^`]+`\} className="text-muted-foreground hover:text-foreground transition-colors" title="Edit">\s*<Edit className="w-5 h-5" \/>\s*<\/Link>\s*){2,}/g;
    
    c = c.replace(regex, '$1');
    fs.writeFileSync(p, c);
  }
});
