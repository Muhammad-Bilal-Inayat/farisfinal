const fs = require('fs');
let code = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

// 1. Container gap
code = code.replace(
  /className="space-y-4 sm:space-y-2 text-base sm:text-sm text-gray-700 leading-tight"/g,
  'className="space-y-4 sm:space-y-2 text-base sm:text-sm text-gray-700 leading-tight"'
); // unchanged, space-y-4 is good

// 2. li wrapper
code = code.replace(
  /className=\{`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-2 rounded-xl border sm:border-0 transition-colors \$\{/g,
  'className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-2 p-4 sm:p-2 rounded-2xl sm:rounded-xl border shadow-sm sm:shadow-none sm:border-0 transition-colors ${'
);

// 3. Bullet & Name
code = code.replace(
  /className="text-\[var\(--color-saudi-green\)\] font-bold mt-1 sm:mt-0">•<\/span>/g,
  'className="text-[var(--color-saudi-green)] font-black text-xl sm:text-base mt-0.5 sm:mt-0">•</span>'
);
code = code.replace(
  /className="break-words font-bold text-gray-800"/g,
  'className="break-words font-extrabold text-[17px] sm:text-sm text-gray-900 leading-snug"'
);

// 4. Bottom Row Divider & Layout
code = code.replace(
  /className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100"/g,
  'className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100/80"'
);

// 5. Price
code = code.replace(
  /className=\{`shrink-0 font-extrabold text-lg sm:text-base \$\{isThisActive \? 'text-amber-950' : 'text-\[var\(--color-saudi-green\)\]'\}`\}/g,
  'className={`shrink-0 font-black text-2xl sm:text-base ${isThisActive ? \'text-amber-950\' : \'text-[var(--color-saudi-green)]\'}`}'
);
code = code.replace(
  /<span className="text-xs font-semibold text-gray-500">SR<\/span>/g,
  '<span className="text-sm sm:text-xs font-bold text-gray-500">SR</span>'
);

// 6. Book Button
code = code.replace(
  /className="px-5 sm:px-4 py-2\.5 sm:py-1\.5 bg-\[var\(--color-saudi-green\)\] text-white text-sm font-bold rounded-xl hover:bg-\[var\(--color-saudi-emerald\)\] transition-colors cursor-pointer shadow-md min-h-\[44px\] sm:min-h-\[36px\]"/g,
  'className="px-6 sm:px-4 py-2.5 sm:py-1.5 bg-[var(--color-saudi-green)] text-white text-base sm:text-sm font-bold rounded-xl hover:bg-[var(--color-saudi-emerald)] transition-colors cursor-pointer shadow-md min-h-[46px] sm:min-h-[36px] w-[110px] sm:w-auto"'
);

fs.writeFileSync('src/pages/RoutesRates.tsx', code);
