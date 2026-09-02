const fs = require('fs');
const path = require('path');

const pages = [
  { file: 'Contact.tsx', titleEn: "Contact Us", titleKey: "contact" },
  { file: 'Privacy.tsx', titleEn: "Privacy Policy", titleKey: "privacy" },
  { file: 'Terms.tsx', titleEn: "Terms & Conditions", titleKey: "terms" },
  { file: 'Faq.tsx', titleEn: "FAQ", titleKey: "faq" }
];

const DIR = path.join(__dirname, 'src/pages');

for (const page of pages) {
  const filePath = path.join(DIR, page.file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('Breadcrumbs')) {
    console.log(`Already patched ${page.file}`);
    continue;
  }

  // 1. Add import Breadcrumbs from '../components/Breadcrumbs';
  // Find the last import
  const importLines = content.split('\n').filter(line => line.startsWith('import '));
  if (importLines.length > 0) {
    const lastImport = importLines[importLines.length - 1];
    content = content.replace(lastImport, lastImport + "\nimport Breadcrumbs from '../components/Breadcrumbs';");
  } else {
    content = "import Breadcrumbs from '../components/Breadcrumbs';\n" + content;
  }

  // 2. Add Breadcrumbs after <div className="bg-[var(--color-soft-ivory)] min-h-screen pb-20">
  // or <div className="bg-[#F1F4F8] min-h-screen pb-20">
  const breadcrumbsStr = `\n      <Breadcrumbs items={[{ label: t('${page.titleKey}') || '${page.titleEn}' }]} />\n`;
  
  content = content.replace(/return \(\s*<div[^>]*>/, (match) => {
    return match + breadcrumbsStr;
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Patched ${page.file}`);
}
