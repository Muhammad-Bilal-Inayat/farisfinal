const fs = require('fs');
let code = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

// 1. Vehicle Card Header
code = code.replace(
  /className="text-xl sm:text-2xl font-black/g,
  'className="text-2xl sm:text-3xl font-black'
);

// 2. Vehicle Card Specs Row (Passengers / Luggage)
code = code.replace(
  /className="px-6 pb-4 flex items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-gray-700"/g,
  'className="px-6 pb-4 flex items-center justify-center gap-6 text-sm sm:text-base font-bold text-gray-800"'
);

// 3. Highlighted Route Callout
code = code.replace(
  /className="mx-4 mb-3 p-2\.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs"/g,
  'className="mx-4 mb-3 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-sm shadow-sm"'
);
code = code.replace(
  /className="text-\[10px\] font-bold text-emerald-800 uppercase block"/g,
  'className="text-xs sm:text-sm font-extrabold text-emerald-800 uppercase block"'
);
code = code.replace(
  /className="font-extrabold text-\[var\(--color-saudi-green\)\] text-sm"/g,
  'className="font-extrabold text-[var(--color-saudi-green)] text-xl"'
);
code = code.replace(
  /className="px-3 py-1 bg-\[var\(--color-saudi-green\)\] text-white text-\[11px\] font-bold rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"/g,
  'className="px-4 py-2.5 bg-[var(--color-saudi-green)] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[var(--color-saudi-emerald)] transition-colors cursor-pointer shadow-sm min-h-[44px]"'
);

// 4. Route List - Container
code = code.replace(
  /className="space-y-3 sm:space-y-2 text-sm text-gray-700 leading-tight"/g,
  'className="space-y-4 sm:space-y-2 text-base sm:text-sm text-gray-700 leading-tight"'
);

// 5. Route List - Items
code = code.replace(
  /gap-2 p-2 sm:p-1\.5 rounded-lg border sm:border-0/g,
  'gap-3 p-3 sm:p-2 rounded-xl border sm:border-0'
);

// 6. Route List - Text Weight
code = code.replace(
  /className="break-words font-medium"/g,
  'className="break-words font-bold text-gray-800"'
);

// 7. Route List - Price Size
code = code.replace(
  /className=\{`shrink-0 font-bold text-base sm:text-sm \$\{isThisActive \? 'text-amber-950 font-black' : 'text-gray-900'\}`\}/g,
  'className={`shrink-0 font-extrabold text-lg sm:text-base ${isThisActive ? \'text-amber-950\' : \'text-[var(--color-saudi-green)]\'}`}'
);

// 8. Route List - Book Button
code = code.replace(
  /className="px-4 sm:px-3 py-1\.5 sm:py-1 bg-\[var\(--color-saudi-green\)\] text-white text-xs font-bold rounded-lg hover:bg-\[var\(--color-saudi-emerald\)\] transition-colors cursor-pointer shadow-sm min-h-\[32px\] sm:min-h-\[auto\]"/g,
  'className="px-5 sm:px-4 py-2.5 sm:py-1.5 bg-[var(--color-saudi-green)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-saudi-emerald)] transition-colors cursor-pointer shadow-md min-h-[44px] sm:min-h-[36px]"'
);

// 9. Quick Route Pills (Filter Buttons)
code = code.replace(
  /className=\{`group relative overflow-hidden rounded-full py-3\.5 px-4 sm:px-5 text-xs sm:text-sm font-bold/g,
  'className={`group relative overflow-hidden rounded-full py-4 px-5 sm:px-6 text-sm sm:text-base font-bold'
);

// 10. Selected Vehicle Header
code = code.replace(
  /className="text-2xl sm:text-3xl font-black text-\[var\(--color-dark-charcoal\)\] text-center"/g,
  'className="text-3xl sm:text-4xl font-black text-[var(--color-dark-charcoal)] text-center tracking-tight"'
);

fs.writeFileSync('src/pages/RoutesRates.tsx', code);
