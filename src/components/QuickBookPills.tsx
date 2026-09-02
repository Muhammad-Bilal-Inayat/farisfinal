import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { QUICK_ROUTE_PILLS } from '../data/fleetRoutesData';

export default function QuickBookPills() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();

  const handleRouteClick = (pillId: string) => {
    navigate(`/routes-rates?pill=${pillId}`);
  };

  return (
    <section className="py-6 sm:py-10 bg-white border-b border-slate-200 shadow-sm w-full">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-950 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
              {isAr ? 'تصفية سريعة حسب المسار:' : 'Quick Route Filter:'}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-gray-700 font-bold">
            {isAr ? 'انقر على أي مسار لعرض الأسعار لجميع السيارات' : 'Click any route to check prices across all fleet cards'}
          </span>
        </div>

        {/* Responsive Pill Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {QUICK_ROUTE_PILLS.map(pill => (
            <button
              key={pill.id}
              onClick={() => handleRouteClick(pill.id)}
              className="group relative overflow-hidden rounded-xl py-3 px-3 text-xs sm:text-sm font-black text-center transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center bg-[#05513F] text-amber-300 hover:bg-[#044032] hover:text-white border border-[#05513F] active:scale-[0.97] min-h-[44px]"
            >
              <span className="relative z-10 leading-snug">{isAr ? pill.nameAr : pill.nameEn}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

