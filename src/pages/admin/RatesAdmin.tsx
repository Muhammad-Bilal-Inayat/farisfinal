import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit, Trash2, Banknote, Search, Car, MapPin, 
  ArrowRight, CheckCircle, X, Tag 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RatesAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [rates, setRates] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>('all');
  
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<any>({});
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [resR, resV, resRoutes] = await Promise.all([
        fetch('/api/admin/trip_rates', { headers, cache: 'no-store' }),
        fetch('/api/admin/vehicles', { headers, cache: 'no-store' }),
        fetch('/api/admin/trip_routes', { headers, cache: 'no-store' })
      ]);

      let ratesData: any[] = [];
      let vehiclesData: any[] = [];
      let routesData: any[] = [];

      if (resR.ok) {
        const d = await resR.json();
        if (Array.isArray(d)) ratesData = d;
      }
      if (resV.ok) {
        const d = await resV.json();
        if (Array.isArray(d)) vehiclesData = d;
      }
      if (resRoutes.ok) {
        const d = await resRoutes.json();
        if (Array.isArray(d)) routesData = d;
      }

      // Fallbacks if admin endpoint returned empty
      if (ratesData.length === 0) {
        const fb = await fetch('/api/trip_rates', { cache: 'no-store' });
        if (fb.ok) {
          const d = await fb.json();
          if (Array.isArray(d)) ratesData = d;
        }
      }
      if (vehiclesData.length === 0) {
        const fb = await fetch('/api/vehicles', { cache: 'no-store' });
        if (fb.ok) {
          const d = await fb.json();
          if (Array.isArray(d)) vehiclesData = d;
        }
      }
      if (routesData.length === 0) {
        const fb = await fetch('/api/trip_routes', { cache: 'no-store' });
        if (fb.ok) {
          const d = await fb.json();
          if (Array.isArray(d)) routesData = d;
        }
      }

      setRates(ratesData);
      setVehicles(vehiclesData);
      setRoutes(routesData);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = current.id ? 'PUT' : 'POST';
    const url = current.id ? `/api/admin/trip_rates/${current.id}` : '/api/admin/trip_rates';
    try {
      const res = await fetch(url, { 
        method, 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` 
        }, 
        body: JSON.stringify(current) 
      });
      if (res.ok) {
        showToast(isAr ? 'تم تحديث التسعيرة ومزامنة الموقع بنجاح' : 'Rate saved and synced to website successfully');
        setIsEditing(false);
        fetchData();
        window.dispatchEvent(new CustomEvent('faris_routes_updated'));
      }
    } catch (e) { alert("Failed to save rate"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذه التسعيرة؟" : "Delete this rate forever?")) return;
    try {
      const res = await fetch(`/api/admin/trip_rates/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } 
      });
      if (res.ok) {
        showToast(isAr ? 'تم حذف التسعيرة' : 'Rate deleted');
        fetchData();
        window.dispatchEvent(new CustomEvent('faris_routes_updated'));
      }
    } catch (e) { alert("Failed to delete"); }
  };

  const getVehicle = (id: number) => vehicles.find(v => v.id === id);

  const filtered = rates.filter(r => {
    const matchesSearch = 
      (r.pickup || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.destination || '').toLowerCase().includes(search.toLowerCase()) ||
      (getVehicle(r.vehicleId)?.name || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedVehicleFilter === 'all') return true;
    return String(r.vehicleId) === selectedVehicleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="p-4 rounded-xl bg-[var(--color-saudi-emerald)] text-white shadow-lg flex items-center justify-between text-sm font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isAr ? 'جدول أسعار المسارات والسيارات' : 'Trip Rates & Vehicle Matrix'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? 'تحديد التكلفة الدقيقة لكل سيارة على كل مسار محدد' : 'Exact SAR rates configured per vehicle model on specific Umrah routes'}
          </p>
        </div>

        <button 
          onClick={() => { 
            setCurrent({ 
              pickup: routes[0]?.pickup || 'Jeddah Airport (JED)', 
              destination: routes[0]?.destination || 'Makkah Hotel', 
              price: 250, 
              vehicleId: vehicles[0]?.id || 1, 
              status: 'active' 
            }); 
            setIsEditing(true); 
          }} 
          className="px-4 py-2 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>{isAr ? '+ إضافة تسعيرة جديدة' : '+ Add Rate'}</span>
        </button>
      </div>

      {/* Search and Vehicle Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedVehicleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedVehicleFilter === 'all' ? 'bg-[var(--color-saudi-emerald)] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isAr ? 'جميع المركبات' : 'All Vehicles'} ({rates.length})
          </button>
          {vehicles.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVehicleFilter(String(v.id))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedVehicleFilter === String(v.id) ? 'bg-[var(--color-saudi-emerald)] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {v.name} ({rates.filter(r => r.vehicleId === v.id).length})
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder={isAr ? 'بحث بالمسار أو السعر...' : 'Search route, vehicle...'} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-dark-charcoal)] text-[11px] uppercase font-bold tracking-wider text-white border-b border-gray-800">
                <th className="p-4">{isAr ? 'المسار المحدد' : 'Transfer Route'}</th>
                <th className="p-4">{isAr ? 'فئة ونوع المركبة' : 'Vehicle Type'}</th>
                <th className="p-4">{isAr ? 'السعر الثابت' : 'Fixed Rate (SAR)'}</th>
                <th className="p-4 text-right">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm font-medium divide-y divide-gray-200 text-[var(--color-dark-charcoal)]">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400">{isAr ? 'جاري تحميل جدول الأسعار...' : 'Loading rates...'}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400">{isAr ? 'لا توجد تسعيرات مطابقة' : 'No rates found'}</td></tr>
              ) : (
                filtered.map(r => {
                  const v = getVehicle(r.vehicleId);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-600 shrink-0" />
                          <span>{r.pickup}</span>
                          <ArrowRight size={13} className="text-slate-400" />
                          <span>{r.destination}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-center font-bold text-xs">
                            <Car size={16} />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{v?.name || `Vehicle #${r.vehicleId}`}</div>
                            <div className="text-[11px] text-slate-400 font-semibold">{v?.category || 'Luxury Fleet'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 border border-gray-300 text-[var(--color-saudi-emerald)] font-extrabold text-sm rounded-xl">
                          <Tag size={13} className="text-gray-600" />
                          {r.price}{r.priceMax ? ` - ${r.priceMax}` : ''} SAR
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => { setCurrent(r); setIsEditing(true); }} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(r.id)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {current.id ? (isAr ? 'تعديل التسعيرة' : 'Edit Rate') : (isAr ? 'إضافة تسعيرة جديدة' : 'Add Rate')}
              </h2>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Quick Route selector if available */}
            {routes.length > 0 && !current.id && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'اختر من المسارات المعتمدة' : 'Select from Existing Routes'}</label>
                <select 
                  onChange={e => {
                    const selectedRoute = routes.find(rt => rt.id === parseInt(e.target.value));
                    if (selectedRoute) {
                      setCurrent({
                        ...current,
                        pickup: selectedRoute.pickup,
                        destination: selectedRoute.destination
                      });
                    }
                  }} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                >
                  <option value="">{isAr ? '-- اختر مسار --' : '-- Choose a Route Preset --'}</option>
                  {routes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.nameEn} ({rt.pickup} ➔ {rt.destination})</option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الانطلاق' : 'Pickup'}</label>
                  <input 
                    type="text" 
                    value={current.pickup || ''} 
                    onChange={e => setCurrent({ ...current, pickup: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الوجهة' : 'Destination'}</label>
                  <input 
                    type="text" 
                    value={current.destination || ''} 
                    onChange={e => setCurrent({ ...current, destination: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'السيارة' : 'Vehicle Model'}</label>
                <select 
                  value={current.vehicleId || ''} 
                  onChange={e => setCurrent({ ...current, vehicleId: parseInt(e.target.value) })} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                  required
                >
                  <option value="">{isAr ? 'اختر السيارة' : 'Select Vehicle'}</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category}) - {v.passengerCapacity} Pax</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'السعر (ريال)' : 'Price (SAR)'}</label>
                  <input 
                    type="number" 
                    value={current.price || 0} 
                    onChange={e => setCurrent({ ...current, price: parseInt(e.target.value) || 0 })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'السعر الأقصى (اختياري)' : 'Max Price (Optional)'}</label>
                  <input 
                    type="number" 
                    value={current.priceMax || ''} 
                    onChange={e => setCurrent({ ...current, priceMax: e.target.value ? parseInt(e.target.value) : null })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none placeholder-slate-400" 
                    placeholder="e.g. 240"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  {isAr ? 'حفظ التسعيرة' : 'Save Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
