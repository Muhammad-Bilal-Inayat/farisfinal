import fs from 'fs';

let content = fs.readFileSync('src/context/SiteSettingsContext.tsx', 'utf8');

// Add homePageConfig to interface
content = content.replace(/popupImageBase64\?: string;/g, "popupImageBase64?: string;\n  homePageConfig?: string;");

fs.writeFileSync('src/context/SiteSettingsContext.tsx', content);
console.log('Context patched');
