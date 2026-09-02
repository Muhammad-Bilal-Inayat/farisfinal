const fs = require('fs');
let code = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

// 1. Extract the vehicle card JSX into a functional component or a constant function
// Actually, it's easier to just use a render function inside the component.

const renderVehicleFunction = `
  const renderVehicleCard = (vehicle: VehicleFleet) => {
    const activeRouteItem = vehicle.routes.find(r => r.routeId === activeRouteId);
    return (
      <div 
        id={'vehicle-card-' + vehicle.id}
        key={vehicle.id}
        className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-emerald-300 group"
      >
        <div className="pt-6 pb-3 px-6 text-center">
          <h3 className="text-xl sm:text-2xl font-black text-[var(--color-dark-charcoal)] tracking-tight">
            {vehicle.name}
          </h3>
        </div>
        <div className="px-6 pb-4 flex items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-gray-700">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#1b314b] text-white flex items-center justify-center shrink-0">
              <Users size={12} />
            </div>
            <span>({isAr ? vehicle.passengersAr : vehicle.passengers})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase size={15} className="text-gray-600" />
            <span>({isAr ? vehicle.luggageAr : vehicle.luggage})</span>
          </div>
        </div>
        <hr className="border-gray-200 mx-4" />
        <div className="px-6 py-4 flex items-center justify-center bg-radial from-gray-50 to-white min-h-[190px]">
          <ResponsiveImage 
            src={vehicle.image} 
            alt={vehicle.name}
            loading="lazy"
            className="max-h-40 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
            onError={(e: any) => {
              e.target.setAttribute('src', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80');
            }}
          />
        </div>
        {activeRouteItem && (
          <div className="mx-4 mb-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                {isAr ? 'سعر المسار المحدد' : 'Selected Route Price'}
              </span>
              <span className="font-extrabold text-[var(--color-saudi-green)] text-sm">
                {activeRouteItem.price} SR
              </span>
            </div>
            <button
              onClick={() => handleBookVehicle(vehicle, activeRouteItem)}
              className="px-3 py-1 bg-[var(--color-saudi-green)] text-white text-[11px] font-bold rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              {isAr ? 'حجز هذا المسار' : 'Book Route'}
            </button>
          </div>
        )}
        <div className="px-5 py-4 flex-1 bg-white">
          <ul className="space-y-3 sm:space-y-2 text-sm text-gray-700 leading-tight">
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
          </ul>
        </div>
        <div className="p-5 pt-3 bg-gray-50/60 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={() => handleBookVehicle(vehicle, activeRouteItem)}
            className="w-full bg-black hover:bg-gray-900 active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold text-base min-h-[48px] tracking-wide transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isAr ? 'احجز الآن!' : 'Book Now!'}</span>
            <ArrowRight size={15} className="rtl:rotate-180 text-[var(--color-luxury-gold)]" />
          </button>
          <button
            onClick={() => handleWhatsAppBooking(vehicle, activeRouteItem)}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-[var(--color-saudi-green)] border border-emerald-200 py-3 px-4 rounded-xl font-bold text-sm min-h-[44px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageSquare size={13} />
            <span>{isAr ? 'استفسار عبر واتساب' : 'Inquire on WhatsApp'}</span>
          </button>
        </div>
      </div>
    );
  };
`;

// Now find where activeRouteId is defined to insert this function
code = code.replace(
  /const activeRouteId = getPillMatchingRouteId\(selectedPillId\);/,
  `const activeRouteId = getPillMatchingRouteId(selectedPillId);\n\n${renderVehicleFunction}\n\n  const mainVehicleId = searchParams.get('vehicle');\n  const mainVehicle = mainVehicleId ? filteredVehicles.find(v => v.id === mainVehicleId) : null;\n  const otherVehicles = mainVehicleId ? filteredVehicles.filter(v => v.id !== mainVehicleId) : filteredVehicles;`
);

// Now replace the grid rendering
const gridReplacement = `
          {mainVehicle && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-6 justify-center">
                <Sparkles className="text-[var(--color-saudi-green)]" size={24} />
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-dark-charcoal)] text-center">
                  {isAr ? 'السيارة المختارة' : 'Selected Vehicle'}
                </h2>
                <Sparkles className="text-[var(--color-saudi-green)]" size={24} />
              </div>
              <div className="max-w-2xl mx-auto ring-4 ring-[var(--color-saudi-green)]/20 rounded-2xl shadow-2xl scale-[1.02] transform transition-all">
                {renderVehicleCard(mainVehicle)}
              </div>
            </div>
          )}

          {otherVehicles.length > 0 && (
            <div>
              {mainVehicle && (
                <div className="mb-8 text-center border-t border-gray-200 pt-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {isAr ? 'سيارات أخرى في أسطولنا' : 'Other Vehicles in our Fleet'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2">{isAr ? 'تصفح خيارات إضافية تناسب احتياجاتك' : 'Browse more options for your journey'}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {otherVehicles.map(vehicle => renderVehicleCard(vehicle))}
              </div>
            </div>
          )}
`;

code = code.replace(
  /\{\/\* Cards Grid: 3 columns on large screens \*\/\}[\s\S]*?(?=\{\/\* Ad Banner for monetization \*\/)/,
  gridReplacement
);

fs.writeFileSync('src/pages/RoutesRates.tsx', code);
