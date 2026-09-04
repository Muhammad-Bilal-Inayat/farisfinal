const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const targetImport = `import BrandLogo from './BrandLogo';`;
const replaceImport = `import BrandLogo from './BrandLogo';
import AdBanner from './AdBanner';`;

const targetFooter = `return (
    <footer`;
const replaceFooter = `return (
    <>
    {settings.adsenseFooterSlot && (
      <div className="container mx-auto px-4 py-4">
        <AdBanner slotId={settings.adsenseFooterSlot} />
      </div>
    )}
    <footer`;

if (!content.includes('AdBanner')) {
  content = content.replace(targetImport, replaceImport);
  content = content.replace(targetFooter, replaceFooter);
  // Also need to wrap the return in <> ... </> because we are returning siblings now
  content = content.replace(/<\/footer>\s*$/g, `</footer>\n    </>`);
  fs.writeFileSync('src/components/Footer.tsx', content);
  console.log("Patched Footer.tsx");
}
