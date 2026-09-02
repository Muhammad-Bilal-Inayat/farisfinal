import fs from 'fs';

let content = fs.readFileSync('src/components/Header.tsx', 'utf8');
content = content.replace(/handleBookNowClick\(e\)/g, 'handleBookNowClick()');
fs.writeFileSync('src/components/Header.tsx', content);

content = fs.readFileSync('src/pages/Vehicles.tsx', 'utf8');
content = content.replace(/openWhatsApp\(\`Hello/g, "openWhatsApp('booking', `Hello");
content = content.replace(/<AdBanner position="bottom" \/>/g, '<AdBanner />');
fs.writeFileSync('src/pages/Vehicles.tsx', content);

content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');
if (!content.includes("import { Link }")) {
  content = content.replace(/import { useNavigate } from 'react-router-dom';/, "import { useNavigate, Link } from 'react-router-dom';");
  fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);
}

console.log('Fixed lint errors');
