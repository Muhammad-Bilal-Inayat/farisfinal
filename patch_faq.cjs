const fs = require('fs');
let code = fs.readFileSync('src/pages/Faq.tsx', 'utf8');

code = code.replace(/text-sm sm:text-base font-bold/g, 'text-base sm:text-lg font-bold');
code = code.replace(/text-sm text-gray-600/g, 'text-base sm:text-sm text-gray-600');

fs.writeFileSync('src/pages/Faq.tsx', code);
