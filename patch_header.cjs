const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Inside mobile menu, make buttons larger
code = code.replace(/text-sm font-semibold/g, 'text-base font-semibold');
code = code.replace(/text-xs font-semibold/g, 'text-sm font-semibold');
code = code.replace(/text-xs font-bold/g, 'text-sm font-bold');
code = code.replace(/text-\[11px\] font-bold/g, 'text-xs font-bold');
code = code.replace(/py-3\.5/g, 'py-4'); // larger tap targets
code = code.replace(/py-3/g, 'py-4'); // larger tap targets

fs.writeFileSync('src/components/Header.tsx', code);
