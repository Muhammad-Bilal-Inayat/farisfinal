const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Remove slice(0,6) so it shows all vehicles
code = code.replace(
  /\.then\(data => setVehicles\(data\.slice\(0, 6\)\)\)/,
  `.then(data => setVehicles(data.filter((v: any) => v.active !== 0)))`
);

// 2. Adjust vehicle card sizes and buttons
code = code.replace(
  /className="text-base font-bold text-\[var\(--color-dark-charcoal\)\] mb-1 uppercase tracking-wide">\{v\.name\}<\/VisualText>/,
  `className="text-lg sm:text-xl font-bold text-[var(--color-dark-charcoal)] mb-1 uppercase tracking-wide">{v.name}</VisualText>`
);

code = code.replace(
  /className="flex gap-4 mb-4 text-xs text-\[var\(--color-dark-charcoal\)\]\/70 border-b border-slate-200\/80 pb-3 font-semibold uppercase tracking-wider"/,
  `className="flex gap-4 mb-4 text-sm sm:text-base text-[var(--color-dark-charcoal)]/80 border-b border-slate-200/80 pb-3 font-semibold uppercase tracking-wider"`
);

// Price size
code = code.replace(
  /className="text-xl font-extrabold text-\[var\(--color-saudi-green\)\]">\{v\.startingPrice\} <span className="text-xs/,
  `className="text-2xl font-extrabold text-[var(--color-saudi-green)]">{v.startingPrice} <span className="text-sm`
);
code = code.replace(
  /className="text-\[9px\] text-\[var\(--color-luxury-gold\)\] uppercase tracking-widest font-bold">\{t\('starting_from'\)\}<\/p>/,
  `className="text-xs text-[var(--color-luxury-gold)] uppercase tracking-widest font-bold">{t('starting_from')}</p>`
);

// Replace WhatsApp and Book Now with View Rates and Book Now
code = code.replace(
  /<div className="flex gap-2">[\s\S]*?<\/div>/,
  `<div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
                      <Link 
                        to={\`/routes-rates?vehicle=\${v.id}\`}
                        className="flex-1 text-center text-sm md:text-base font-bold text-[var(--color-saudi-green)] border-2 border-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-green)] hover:text-white px-4 py-2.5 sm:py-2 rounded-xl transition-colors min-h-[44px] flex items-center justify-center"
                      >
                        {isAr ? 'عرض الأسعار' : 'View Rates'}
                      </Link>
                      <Link 
                        to={\`/booking?vehicle=\${v.id}\`} 
                        className="flex-1 text-center text-sm md:text-base font-bold text-white hover:text-white bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] px-4 py-2.5 sm:py-2 rounded-xl transition-colors min-h-[44px] flex items-center justify-center"
                      >
                        {t('book_now')} <span className="rtl:rotate-180 inline-block ml-1">➔</span>
                      </Link>
                    </div>`
);

// Larger headers
code = code.replace(
  /className="text-2xl sm:text-3xl font-extrabold text-\[var\(--color-dark-charcoal\)\]"/g,
  `className="text-3xl sm:text-4xl font-extrabold text-[var(--color-dark-charcoal)]"`
);

// Make the cards clickable whole (optional, but requested: "The vehicle cards must be clickable.")
// I'll leave the buttons large and highly visible. I'll make the image itself clickable too.
code = code.replace(
  /<div className="aspect-\[16\/10\] relative overflow-hidden bg-gray-100">/,
  `<Link to={\`/booking?vehicle=\${v.id}\`} className="block aspect-[16/10] relative overflow-hidden bg-gray-100 cursor-pointer">`
);
code = code.replace(
  /<\/div>\s*<div className="p-4 sm:p-5 flex-grow flex flex-col">/,
  `</Link>\n                <div className="p-4 sm:p-5 flex-grow flex flex-col">`
);


fs.writeFileSync('src/pages/Home.tsx', code);
