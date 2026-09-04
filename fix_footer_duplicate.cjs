const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const target = `const settings = useSiteSettings();`;
const replacement = `const siteSettings = useSiteSettings();`;

const target2 = `const { companyName, websiteDomain } = settings;`;
const replacement2 = `const { companyName, websiteDomain } = siteSettings;`;

const target3 = `{settings.adsenseFooterSlot && (`;
const replacement3 = `{siteSettings.adsenseFooterSlot && (`;

const target4 = `<AdBanner slotId={settings.adsenseFooterSlot} />`;
const replacement4 = `<AdBanner slotId={siteSettings.adsenseFooterSlot} />`;

content = content.replace(target, replacement);
content = content.replace(target2, replacement2);
content = content.replace(target3, replacement3);
content = content.replace(target4, replacement4);

fs.writeFileSync('src/components/Footer.tsx', content);
console.log("Fixed Footer duplicate settings");
