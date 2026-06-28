const fs = require('fs');

const f = 'd:/Nextgen/billing-software/lib/pdf-generator.ts';
if (fs.existsSync(f)) {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/const (\w+Body) = \[/g, 'const $1: any[] = [');
  fs.writeFileSync(f, content);
  console.log('Fixed', f);
}
