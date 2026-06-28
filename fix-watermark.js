const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, 'lib');
const userDir = path.join(__dirname, 'app', 'user');

// Fix HTML viewers
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
fixHTMLViewers(userDir);

// Fix PDF Generators
const newGetBase64 = sync function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("/")) {
    if (typeof window === "undefined") {
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), "public", imageUrl);
        const buffer = fs.readFileSync(filePath);
        const mimeType = imageUrl.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
        return \data:\;base64,\\;
      } catch (err) {
        console.warn("Could not read local file", imageUrl);
        return "";
      }
    } else {
      try {
        const finalUrl = window.location.origin + imageUrl;
        const res = await fetch(finalUrl);
        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = res.headers.get('content-type') || 'image/png';
        return \data:\;base64,\\;
      } catch(e) { return ""; }
    }
  } else {
    try {
      const res = await fetch(imageUrl);
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = res.headers.get('content-type') || 'image/png';
      return \data:\;base64,\\;
    } catch (err) {
      console.warn("Could not fetch remote image", imageUrl);
      return "";
    }
  }
};

const pdfFiles = fs.readdirSync(libDir).filter(f => f.includes('pdf'));
for (const file of pdfFiles) {
  const fullPath = path.join(libDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Remove PDF watermark
  content = content.replace(/\/\/\s*Watermark[\s\S]*?doc\.restoreGraphicsState\(\);/g, '');
  
  // Replace getBase64ImageFromUrl
  const fnRegex = /async function getBase64ImageFromUrl[\s\S]*?return[^}]*\}[^}]*\}/;
  content = content.replace(fnRegex, newGetBase64);
  
  fs.writeFileSync(fullPath, content);
}
console.log('Fixed watermarks and fetch logic');
