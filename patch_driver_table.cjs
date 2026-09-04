const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/DriverPerformanceAdmin.tsx', 'utf8');

if (!content.includes('Individual Driver Breakdown')) {
  const targetEnd = `      </div>
    </div>
  );
}`;
  
  const replacement = `      </div>

      {/* Driver Wise Table */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users size={18} className="text-emerald-500" />
            {isAr ? 'تفاصيل أداء السائقين' : 'Individual Driver Breakdown'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase">{isAr ? 'السائق' : 'Driver'}</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase">{isAr ? 'الرحلات المكتملة' : 'Completed Trips'}</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase">{isAr ? 'متوسط التقييم' : 'Avg Rating'}</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase">{isAr ? 'إجمالي المراجعات' : 'Total Reviews'}</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((driver, idx) => (
                <tr key={driver.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-900">{driver.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">{driver.Trips}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                      <Star size={14} className={driver.Rating > 0 ? "fill-current" : "text-slate-300"} />
                      <span className={driver.Rating > 0 ? "text-slate-900" : "text-slate-400"}>
                        {driver.Rating > 0 ? driver.Rating.toFixed(1) : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-500">{driver.Reviews}</td>
                </tr>
              ))}
              {performanceData.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                    {isAr ? 'لا توجد بيانات متاحة' : 'No driver data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`;

  content = content.replace(targetEnd, replacement);
  fs.writeFileSync('src/pages/admin/DriverPerformanceAdmin.tsx', content);
  console.log('Driver performance table added');
}
