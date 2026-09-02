const fs = require('fs');
let code = fs.readFileSync('src/components/QuickBookPills.tsx', 'utf8');

const replacement = `import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { QUICK_ROUTE_PILLS } from '../data/fleetRoutesData';

export default function QuickBookPills() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();

  const handleRouteClick = (pillId: string) => {
    navigate(\`/routes-rates?pill=\${pillId}\`);
  };

  return (
    <section className="py-8 bg-[#E9EEF4] border-b border-slate-200/80 shadow-inner w-full">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 bg-emerald-100/70 px-2.5 py-1 rounded-md">
              {isAr ? 'تصفية سريعة حسب المسار:' : 'Quick Route Filter:'}
            </span>
          </div>
          <span className="text-xs text-gray-600 font-medium hidden sm:inline">
            {isAr ? 'انقر على أي مسار لعرض الأسعار لجميع السيارات' : 'Click any route to check prices across all fleet cards'}
          </span>
        </div>

        {/* 12 Green Rounded Pill Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {QUICK_ROUTE_PILLS.map(pill => (
            <button
              key={pill.id}
              onClick={() => handleRouteClick(pill.id)}
              className="group relative overflow-hidden rounded-full py-3.5 px-4 sm:px-5 text-xs sm:text-sm font-bold text-center transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center text-balance bg-[#006644] hover:bg-[#005237] active:scale-[0.98] text-white hover:shadow-lg"
            >
              <span className="relative z-10">{isAr ? pill.nameAr : pill.nameEn}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync('src/components/QuickBookPills.tsx', replacement);
