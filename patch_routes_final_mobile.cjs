const fs = require('fs');
let code = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

const regex = /<li\s+key=\{r\.routeId\}[\s\S]*?<\/li>/;

const newLi = `<li 
                  key={r.routeId}
                  className={\`flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-2 p-5 sm:p-2 rounded-2xl sm:rounded-xl border-2 sm:border-0 shadow-sm sm:shadow-none transition-colors \${
                    isThisActive 
                      ? 'bg-amber-50/90 border-amber-300 ring-0' 
                      : 'bg-white border-gray-100 hover:bg-gray-50'
                  }\`}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-2 flex-1 min-w-0">
                    <div className="mt-1.5 sm:mt-0 w-2.5 h-2.5 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--color-saudi-green)] shrink-0 shadow-sm"></div>
                    <span className="break-words font-black text-[19px] sm:text-sm text-gray-900 leading-snug sm:leading-normal" title={isAr ? r.routeNameAr : r.routeNameEn}>
                      {isAr ? r.routeNameAr : r.routeNameEn}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t-2 border-dashed sm:border-solid sm:border-t-0 border-gray-200/80 sm:border-transparent">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1">
                      <span className="text-[11px] text-gray-400 font-extrabold uppercase tracking-widest sm:hidden mb-0.5">
                        {isAr ? 'السعر' : 'Fare'}
                      </span>
                      <span className={\`shrink-0 font-black text-[28px] sm:text-base leading-none \${isThisActive ? 'text-amber-950' : 'text-[var(--color-saudi-green)]'}\`}>
                        {r.price} <span className="text-sm sm:text-xs font-bold text-gray-500">SR</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleBookVehicle(vehicle, r)}
                      className="px-8 sm:px-4 py-3.5 sm:py-1.5 bg-[var(--color-saudi-green)] text-white text-lg sm:text-sm font-black rounded-xl hover:bg-[var(--color-saudi-emerald)] transition-colors cursor-pointer shadow-lg sm:shadow-md"
                    >
                      {isAr ? 'احجز' : 'Book'}
                    </button>
                  </div>
                </li>`;

code = code.replace(regex, newLi);

fs.writeFileSync('src/pages/RoutesRates.tsx', code);
