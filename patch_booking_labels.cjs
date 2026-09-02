const fs = require('fs');
let code = fs.readFileSync('src/components/BookingWidget.tsx', 'utf8');

code = code.replace(/text-\[11px\] uppercase font-bold text-gray-900/g, 'text-[13px] sm:text-[11px] uppercase font-bold text-gray-900');

fs.writeFileSync('src/components/BookingWidget.tsx', code);
