const fs = require('fs');
const path = require('path');

// 1. app/layout.tsx
let layoutFile = path.join(__dirname, '..', 'app', 'layout.tsx');
let layoutContent = fs.readFileSync(layoutFile, 'utf8');
layoutContent = layoutContent.replace(
  `initialPageTheme={cookieStore.get("pageTheme")?.value}`,
  `initialAdminPageTheme={cookieStore.get("adminPageTheme")?.value}\n          initialUserPageTheme={cookieStore.get("userPageTheme")?.value}`
);
fs.writeFileSync(layoutFile, layoutContent, 'utf8');

// 2. app/actions/user.ts
let actionsFile = path.join(__dirname, '..', 'app', 'actions', 'user.ts');
let actionsContent = fs.readFileSync(actionsFile, 'utf8');
actionsContent = actionsContent.replace(
  /cookieStore\.set\('pageTheme', encodeURIComponent\(pageTheme\)/g,
  `cookieStore.set(role === 'admin' ? 'adminPageTheme' : 'userPageTheme', encodeURIComponent(pageTheme)`
);
fs.writeFileSync(actionsFile, actionsContent, 'utf8');

// 3. app/api/auth/login/route.ts
let loginFile = path.join(__dirname, '..', 'app', 'api', 'auth', 'login', 'route.ts');
let loginContent = fs.readFileSync(loginFile, 'utf8');
loginContent = loginContent.replace(
  /name: 'pageTheme',/g,
  `name: role === 'admin' ? 'adminPageTheme' : 'userPageTheme',`
);
fs.writeFileSync(loginFile, loginContent, 'utf8');

// 4. app/admin/dashboard/ClientLayout.tsx
let adminLayoutFile = path.join(__dirname, '..', 'app', 'admin', 'dashboard', 'ClientLayout.tsx');
let adminLayoutContent = fs.readFileSync(adminLayoutFile, 'utf8');
adminLayoutContent = adminLayoutContent.replace(/pageTheme, setPageTheme/g, `adminPageTheme, setAdminPageTheme`);
adminLayoutContent = adminLayoutContent.replace(/pageTheme/g, `adminPageTheme`);
fs.writeFileSync(adminLayoutFile, adminLayoutContent, 'utf8');

// 5. app/user/ClientLayout.tsx
let userLayoutFile = path.join(__dirname, '..', 'app', 'user', 'ClientLayout.tsx');
let userLayoutContent = fs.readFileSync(userLayoutFile, 'utf8');
userLayoutContent = userLayoutContent.replace(/pageTheme, setPageTheme/g, `userPageTheme, setUserPageTheme`);
userLayoutContent = userLayoutContent.replace(/pageTheme/g, `userPageTheme`);
fs.writeFileSync(userLayoutFile, userLayoutContent, 'utf8');

console.log('Split themes script executed');
