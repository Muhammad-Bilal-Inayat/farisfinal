import fs from 'fs';

let content = fs.readFileSync('src/pages/Vehicles.tsx', 'utf8');
content = content.replace(/<AdBanner \/>/g, '<AdBanner dataAdSlot="vehicles-bottom" />');
fs.writeFileSync('src/pages/Vehicles.tsx', content);

content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');
content = `import { Link, useNavigate } from 'react-router-dom';\n` + content;
fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);

console.log('Fixed lint errors again');
