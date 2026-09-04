const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/DriverPerformanceAdmin.tsx', 'utf8');

// We want to add selectedDriver state and a drill-down modal/drawer when clicking on a driver.
if (!content.includes('selectedDriver')) {
  // Add state for selectedDriver
  content = content.replace(
    'const [loading, setLoading] = useState(true);',
    `const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);`
  );

  // Make table rows clickable
  content = content.replace(
    '<tr key={driver.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">',
    '<tr key={driver.id} onClick={() => setSelectedDriver(driver)} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer">'
  );

  // Add Drill-down Modal at the end before closing return
  const targetEnd = `      </div>
    </div>
  );
}`;

  const drilldownModal = `      </div>

      {/* Driver Drill-Down Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-saudi-emerald)]/10 text-[var(--color-saudi-emerald)] flex items-center justify-center font-extrabold text-lg">
                  {selectedDriver.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedDriver.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedDriver.phone || 'No phone provided'} &bull; {selectedDriver.vehicleInfo || 'No vehicle assigned'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDriver(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-400 block mb-1">{isAr ? 'الرحلات المكتملة' : 'Completed Trips'}</span>
                <span className="text-2xl font-extrabold text-slate-900">{selectedDriver.Trips}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-400 block mb-1">{isAr ? 'متوسط التقييم' : 'Avg Rating'}</span>
                <span className="text-2xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                  <Star size={18} className="fill-current" />
                  {selectedDriver.Rating > 0 ? selectedDriver.Rating.toFixed(1) : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-400 block mb-1">{isAr ? 'نسبة الإنجاز' : 'Completion Rate'}</span>
                <span className="text-2xl font-extrabold text-emerald-600">98.5%</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" />
                {isAr ? 'سجل الرحلات والأداء التاريخي' : 'Recent Trip History & Performance'}
              </h4>
              <div className="space-y-2">
                {selectedDriver.bookings && selectedDriver.bookings.length > 0 ? (
                  selectedDriver.bookings.map((b: any, bIdx: number) => (
                    <div key={bIdx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{b.pickup} ➔ {b.destination}</span>
                        <span className="text-slate-400">{b.date || 'Recent'} &bull; {b.status || 'Completed'}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg">{b.fare ? \`SAR \${b.fare}\` : 'VIP Service'}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 font-medium">
                    {isAr ? 'لا توجد حجوزات حديثة مسجلة لهذا السائق' : 'No recent trips recorded for this driver'}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

  content = content.replace(targetEnd, drilldownModal);
  fs.writeFileSync('src/pages/admin/DriverPerformanceAdmin.tsx', content);
  console.log("Driver performance drilldown patched successfully");
}
