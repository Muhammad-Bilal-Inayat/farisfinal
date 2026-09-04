const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const target = `const { companyName, websiteDomain } = useSiteSettings();`;
const replacement = `const settings = useSiteSettings();
  const { companyName, websiteDomain } = settings;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/Footer.tsx', content);
  console.log("Fixed footer destructing");
}
