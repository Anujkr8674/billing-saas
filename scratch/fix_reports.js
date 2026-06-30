const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'app', 'user', 'reports', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Container fixes
content = content.replace(/bg-white/g, 'bg-card');
content = content.replace(/border-gray-100/g, 'border-border');

// Text fixes
content = content.replace(/text-gray-900/g, 'text-foreground');
content = content.replace(/text-gray-500/g, 'text-muted-foreground');

// KPI icon backgrounds (optional, but good for dark mode)
content = content.replace(/bg-blue-50/g, 'bg-blue-50 dark:bg-blue-900/20');
content = content.replace(/bg-emerald-50/g, 'bg-emerald-50 dark:bg-emerald-900/20');
content = content.replace(/bg-rose-50/g, 'bg-rose-50 dark:bg-rose-900/20');
content = content.replace(/bg-amber-50/g, 'bg-amber-50 dark:bg-amber-900/20');

// Additional card background if any
content = content.replace(/bg-gray-50\/30/g, 'bg-muted/30');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed reports page for dark mode');
