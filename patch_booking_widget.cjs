const fs = require('fs');
let code = fs.readFileSync('src/components/BookingWidget.tsx', 'utf8');

// Inputs: Replace p-2.5 with p-3.5 sm:p-2.5
// Replace text-xs md:text-sm with text-base sm:text-sm
// Replace text-sm font-medium with text-base sm:text-sm font-medium
// Specifically looking at className strings

code = code.replace(/p-2\.5 rounded-xl text-xs md:text-sm/g, 'p-3.5 sm:p-2.5 rounded-xl text-base sm:text-sm');
code = code.replace(/p-2\.5 rounded-xl text-sm/g, 'p-3.5 sm:p-2.5 rounded-xl text-base sm:text-sm');

// Buttons
code = code.replace(/py-3\.5 px-6 rounded-xl font-bold text-sm/g, 'py-4 sm:py-3.5 px-6 rounded-xl font-bold text-base sm:text-sm');
code = code.replace(/px-4 py-3\.5 bg-gray-100/g, 'px-5 sm:px-4 py-4 sm:py-3.5 bg-gray-100');
code = code.replace(/text-xs font-bold transition-colors cursor-pointer/g, 'text-sm sm:text-xs font-bold transition-colors cursor-pointer'); // for back button

// Let's also check if there are any other text-xs that need to be text-sm sm:text-xs
// The small labels above the inputs: "text-[10px] sm:text-xs" or something? Let's check.

fs.writeFileSync('src/components/BookingWidget.tsx', code);
