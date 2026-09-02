const fs = require('fs');
let code = fs.readFileSync('src/components/QuickBookPills.tsx', 'utf8');

// Adjust the grid and pill styling for mobile to make them look professional and appropriately sized
code = code.replace(
  /className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"/g,
  'className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"'
);

code = code.replace(
  /className="group relative overflow-hidden rounded-full py-3\.5 px-4 sm:px-5 text-xs sm:text-sm font-bold text-center transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center text-balance bg-\[#006644\] hover:bg-\[#005237\] active:scale-\[0\.98\] text-white hover:shadow-lg"/g,
  'className="group relative overflow-hidden rounded-xl py-3 px-3 sm:py-3.5 sm:px-4 text-[13px] sm:text-sm font-bold text-center transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center bg-white border border-gray-200 text-gray-800 hover:bg-[#006644] hover:text-white hover:border-[#006644] active:scale-[0.98] h-full min-h-[44px]"'
);

fs.writeFileSync('src/components/QuickBookPills.tsx', code);
