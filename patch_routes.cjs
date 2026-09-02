const fs = require('fs');
let code = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

// 1. Add support for searching by vehicle ID in URL
code = code.replace(
  /const pillFromUrl = searchParams\.get\('pill'\) \|\| searchParams\.get\('route'\);/,
  `const pillFromUrl = searchParams.get('pill') || searchParams.get('route');
    const vehicleFromUrl = searchParams.get('vehicle');
    if (vehicleFromUrl) {
      setTimeout(() => {
        const el = document.getElementById('vehicle-card-' + vehicleFromUrl);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }`
);

// Add id to vehicle card
code = code.replace(
  /<div \s*key=\{vehicle\.id\}\s*className="bg-white rounded-2xl/,
  `<div 
                  id={'vehicle-card-' + vehicle.id}
                  key={vehicle.id}
                  className="bg-white rounded-2xl`
);

// 2. Change the route list items to include a "Book" button and increase text sizes for readability
code = code.replace(
  /<ul className="space-y-2 text-\[11px\] sm:text-xs text-gray-700 leading-tight">[\s\S]*?<\/ul>/,
  `<ul className="space-y-3 sm:space-y-2 text-sm text-gray-700 leading-tight">
                      {vehicle.routes.map(r => {
                        const isThisActive = activeRouteId === r.routeId;
                        return (
                          <li 
                            key={r.routeId}
                            className={\`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 sm:p-1.5 rounded-lg border sm:border-0 transition-colors \${
                              isThisActive 
                                ? 'bg-amber-100/90 font-bold text-amber-950 ring-1 ring-amber-300 border-amber-300' 
                                : 'hover:bg-gray-50 border-gray-100 sm:border-transparent'
                            }\`}
                          >
                            <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
                              <span className="text-[var(--color-saudi-green)] font-bold mt-1 sm:mt-0">•</span>
                              <span className="break-words font-medium" title={isAr ? r.routeNameAr : r.routeNameEn}>
                                {isAr ? r.routeNameAr : r.routeNameEn}
                              </span>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                              <span className={\`shrink-0 font-bold text-base sm:text-sm \${isThisActive ? 'text-amber-950 font-black' : 'text-gray-900'}\`}>
                                {r.price} <span className="text-xs font-semibold text-gray-500">SR</span>
                              </span>
                              <button
                                onClick={() => handleBookVehicle(vehicle, r)}
                                className="px-4 sm:px-3 py-1.5 sm:py-1 bg-[var(--color-saudi-green)] text-white text-xs font-bold rounded-lg hover:bg-[var(--color-saudi-emerald)] transition-colors cursor-pointer shadow-sm min-h-[32px] sm:min-h-[auto]"
                              >
                                {isAr ? 'احجز' : 'Book'}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>`
);

// Ensure larger card headers and buttons for mobile readability
code = code.replace(
  /className="w-full bg-black hover:bg-gray-900 active:scale-\[0\.99\] text-white py-3 px-4 rounded-xl font-bold text-sm/,
  `className="w-full bg-black hover:bg-gray-900 active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold text-base min-h-[48px]`
);
code = code.replace(
  /className="w-full bg-emerald-50 hover:bg-emerald-100 text-\[var\(--color-saudi-green\)\] border border-emerald-200 py-2\.5 px-4 rounded-xl font-bold text-xs/,
  `className="w-full bg-emerald-50 hover:bg-emerald-100 text-[var(--color-saudi-green)] border border-emerald-200 py-3 px-4 rounded-xl font-bold text-sm min-h-[44px]`
);

fs.writeFileSync('src/pages/RoutesRates.tsx', code);
