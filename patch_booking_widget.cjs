const fs = require('fs');
let code = fs.readFileSync('src/components/BookingWidget.tsx', 'utf8');

// Form Labels
code = code.replace(/text-xs font-bold text-\[var\(--color-dark-charcoal\)\]/g, 'text-sm font-bold text-[var(--color-dark-charcoal)]');
code = code.replace(/text-xs font-semibold text-gray-700/g, 'text-sm font-semibold text-gray-700');
code = code.replace(/text-xs sm:text-sm font-semibold text-gray-700/g, 'text-sm sm:text-base font-semibold text-gray-700');

// Form Inputs
code = code.replace(/text-sm w-full p-2\.5 sm:p-3/g, 'text-base w-full p-3 sm:p-3.5');
code = code.replace(/text-sm w-full p-3/g, 'text-base w-full p-3.5');

// Main Buttons
code = code.replace(/py-2\.5 sm:py-3/g, 'py-3 sm:py-3.5'); // Larger vertical padding for touch
code = code.replace(/py-3 sm:py-3\.5 px-6 rounded-xl font-bold uppercase tracking-wider text-sm/g, 'py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider text-base min-h-[48px]');
code = code.replace(/px-6 py-2\.5 bg-\[var\(--color-saudi-green\)\] text-white font-bold rounded-xl text-sm/g, 'px-6 py-3 bg-[var(--color-saudi-green)] text-white font-bold rounded-xl text-base min-h-[48px]');

// Back / Next buttons inside the form
code = code.replace(/px-6 py-2\.5/g, 'px-6 py-3 min-h-[48px]');

fs.writeFileSync('src/components/BookingWidget.tsx', code);
