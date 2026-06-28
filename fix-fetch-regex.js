const fs = require('fs');
const path = require('path');
const libDir = path.join(__dirname, 'lib');

const newGetBase64 = `async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("/")) {
    if (typeof window === "undefined") {
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), "public", imageUrl);
        const buffer = fs.readFileSync(filePath);
        const mimeType = imageUrl.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
        return \`data:\${mimeType};base64,\${buffer.toString("base64")}\`;
      } catch (err) {
        return "";
      }
    } else {
      try {
        const finalUrl = window.location.origin + imageUrl;
        const res = await fetch(finalUrl);
        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = res.headers.get('content-type') || 'image/png';
        return \`data:\${mimeType};base64,\${base64}\`;
      } catch(e) { return ""; }
    }
  } else {
    try {
      const res = await fetch(imageUrl);
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = res.headers.get('content-type') || 'image/png';
      return \`data:\${mimeType};base64,\${base64}\`;
    } catch (err) {
      return "";
    }
  }
}

export `;

const pdfFiles = fs.readdirSync(libDir).filter(f => f.includes('pdf'));
for (const file of pdfFiles) {
  if (file === 'moneyreceipt-pdf-generator.ts') continue;
  const fullPath = path.join(libDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  const fnRegex = /async function getBase64ImageFromUrl[\s\S]*?export\s+/;
  if (fnRegex.test(content)) {
    content = content.replace(fnRegex, newGetBase64);
    fs.writeFileSync(fullPath, content);
  }
}
console.log('Fixed fetch regex in PDF generators');
