const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'components', 'ThemeSwitcher.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace pageTheme with the appropriate context properties
content = content.replace(
  /pageTheme, setPageTheme,/g,
  `adminPageTheme, setAdminPageTheme,\n    userPageTheme, setUserPageTheme,`
);

// Determine the active page theme based on panel type
content = content.replace(
  /const currentSidebarTheme = panelType === "admin" \? adminSidebarTheme : userSidebarTheme;/g,
  `const currentSidebarTheme = panelType === "admin" ? adminSidebarTheme : userSidebarTheme;
  const currentPageTheme = panelType === "admin" ? adminPageTheme : userPageTheme;
  const handlePageChange = (theme: string, shouldBroadcast: boolean = false) => {
    if (panelType === "admin") {
      setAdminPageTheme(theme);
      if (shouldBroadcast) broadcastThemeUpdate("adminPage", theme);
    } else {
      setUserPageTheme(theme);
      if (shouldBroadcast) broadcastThemeUpdate("userPage", theme);
    }
  };`
);

// Replace setPageTheme(color); broadcastThemeUpdate("page", color); with handlePageChange
content = content.replace(
  /setPageTheme\(color\);\n\s*broadcastThemeUpdate\("page", color\);/g,
  `handlePageChange(color, true);`
);
content = content.replace(
  /setPageTheme\(val\);\n\s*broadcastThemeUpdate\("page", val\);/g,
  `handlePageChange(val, true);`
);
content = content.replace(
  /setPageTheme\(newHex\);/g,
  `handlePageChange(newHex);`
);

content = content.replace(
  /setPageTheme\("light"\);\n\s*broadcastThemeUpdate\("page", "light"\);/g,
  `handlePageChange("light", true);`
);
content = content.replace(
  /setPageTheme\("dark"\);\n\s*broadcastThemeUpdate\("page", "dark"\);/g,
  `handlePageChange("dark", true);`
);
content = content.replace(
  /setPageTheme\("system"\);\n\s*broadcastThemeUpdate\("page", "system"\);/g,
  `handlePageChange("system", true);`
);


// Replace pageTheme state usages
content = content.replace(/pageTheme\?\.startsWith/g, `currentPageTheme?.startsWith`);
content = content.replace(/pageTheme !== prev/g, `currentPageTheme !== prev`);
content = content.replace(/pageTheme ===/g, `currentPageTheme ===`);
content = content.replace(/, pageTheme\]/g, `, currentPageTheme]`);

fs.writeFileSync(file, content, 'utf8');
console.log('ThemeSwitcher updated');
