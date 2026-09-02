const fs = require('fs');
let code = fs.readFileSync('src/components/PromoPopup.tsx', 'utf8');
code = code.replace('<img loading="lazy"', '<img width="500" height="250" loading="lazy"');
fs.writeFileSync('src/components/PromoPopup.tsx', code);
