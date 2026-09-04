import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Server, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VehicleSyncMonitor() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [publicCount, setPublicCount] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [hasDiscrepancy, setHasDiscrepancy] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkSyncStatus = async () => {
    setIsChecking(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch DB (Admin) - Filter active only manually to compare apples to apples
      const adminRes = await fetch('/api/admin/vehicles', { headers });
      const adminData = await adminRes.json();
      const activeAdminCars = Array.isArray(adminData) ? adminData.filter(v => v.status === 'active') : [];
      setAdminCount(activeAdminCars.length);

      // 2. Fetch Live Cache (Public)
      const publicRes = await fetch('/api/vehicles', { cache: 'no-store' });
      const publicData = await publicRes.json();
      const publicCars = Array.isArray(publicData) ? publicData : [];
      setPublicCount(publicCars.length);

      // 3. Compare lengths and signatures
      let outOfSync = false;
      if (activeAdminCars.length !== publicCars.length) {
        outOfSync = true;
      } else {
        // Deep compare core properties to catch stale edits
        const adminSigs = activeAdminCars.map(v => `${v.id}-${v.name}-${v.displayOrder}-${v.imageUrl}`).join('|');
        const publicSigs = publicCars.map(v => `${v.id}-${v.name}-${v.displayOrder}-${v.imageUrl}`).join('|');
        if (adminSigs !== publicSigs) {
          outOfSync = true;
        }
      }

      setHasDiscrepancy(outOfSync);
      setLastChecked(new Date());
    } catch (e) {
      console.error("Sync check failed", e);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
    const interval = setInterval(checkSyncStatus, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  const forceHardRefresh = async () => {
    if (!window.confirm(isAr ? 'تأكيد مسح ذاكرة التخزين المؤقت بالكامل؟' : 'Confirm forcing a global cache purge?')) return;
    
    setIsClearing(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/admin/cache/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Allow server time to clear
      setTimeout(checkSyncStatus, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsClearing(false);
    }
  };

  if (adminCount === null || publicCount === null) return null;

  return (
    <div className={`mb-6 p-4 rounded-xl border ${hasDiscrepancy ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'} shadow-sm transition-colors duration-500`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2 rounded-lg ${hasDiscrepancy ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {hasDiscrepancy ? <AlertTriangle size={24} className="animate-pulse" /> : <CheckCircle size={24} />}
          </div>
          <div>
            <h3 className={`font-bold text-sm sm:text-base ${hasDiscrepancy ? 'text-red-900' : 'text-emerald-900'}`}>
              {isAr ? 'مراقب مزامنة المركبات' : 'Vehicle Sync Monitor'}
            </h3>
            <div className="flex items-center gap-4 mt-1 text-xs sm:text-sm text-gray-600 font-medium">
              <span className="flex items-center gap-1">
                <Server size={14} /> 
                {isAr ? 'قاعدة البيانات:' : 'Database (Active):'} <strong className="text-gray-900">{adminCount}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Globe size={14} />
                {isAr ? 'الموقع العام (الكاش):' : 'Live Site (Cache):'} <strong className="text-gray-900">{publicCount}</strong>
              </span>
            </div>
            {lastChecked && (
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {isAr ? 'آخر فحص:' : 'Last checked:'} {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={checkSyncStatus}
            disabled={isChecking}
            className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-gray-800 border border-transparent hover:border-gray-200 transition-colors cursor-pointer"
            title={isAr ? 'تحديث التحقق' : 'Refresh Check'}
          >
            <RefreshCw size={18} className={isChecking ? 'animate-spin' : ''} />
          </button>
          
          {(hasDiscrepancy || true) && (
            <button
              onClick={forceHardRefresh}
              disabled={isClearing}
              className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all cursor-pointer shadow-sm flex items-center gap-2 ${
                hasDiscrepancy 
                  ? 'bg-red-600 hover:bg-red-700 hover:shadow-md' 
                  : 'bg-gray-800 hover:bg-gray-900'
              } ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={14} className={isClearing ? 'animate-spin' : ''} />
              {isAr ? 'فرض التحديث العميق' : 'Force Hard Refresh'}
            </button>
          )}
        </div>

      </div>
      
      {hasDiscrepancy && (
        <div className="mt-3 p-3 bg-red-100/50 rounded-lg border border-red-200/50 text-xs sm:text-sm text-red-800 flex gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>
            {isAr 
              ? 'تحذير: تم اكتشاف عدم تطابق بين قاعدة البيانات والكاش العام. يرجى الضغط على "فرض التحديث العميق" لنشر التغييرات على الفور.'
              : 'Warning: Discrepancy detected between database and live cache. Click "Force Hard Refresh" to instantly push changes to the public site.'}
          </p>
        </div>
      )}
    </div>
  );
}
