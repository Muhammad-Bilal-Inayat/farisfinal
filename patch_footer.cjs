const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

// Increase base text size
code = code.replace(/text-sm text-white\/60/g, 'text-base sm:text-sm text-white/60');
code = code.replace(/text-xs text-white\/60/g, 'text-sm text-white/60');
code = code.replace(/text-sm text-emerald-100\/70/g, 'text-base sm:text-sm text-emerald-100/70');
code = code.replace(/text-sm font-semibold/g, 'text-base sm:text-sm font-semibold');
code = code.replace(/text-xs font-semibold/g, 'text-sm font-semibold');

fs.writeFileSync('src/components/Footer.tsx', code);
