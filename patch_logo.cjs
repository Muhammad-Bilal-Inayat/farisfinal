const fs = require('fs');
let code = fs.readFileSync('src/components/BrandLogo.tsx', 'utf8');
code = code.replace('<img ', '<img width="200" height="80" fetchPriority="high" ');
fs.writeFileSync('src/components/BrandLogo.tsx', code);
