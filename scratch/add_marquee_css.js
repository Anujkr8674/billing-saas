const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'app', 'globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('.animate-marquee')) {
  css += `
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
  display: inline-block;
  white-space: nowrap;
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Added marquee CSS to globals.css');
}
