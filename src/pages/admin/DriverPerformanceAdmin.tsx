import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { Users, Star, TrendingUp, Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DriverPerformanceAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const [dRes, bRes, tRes] = await Promise.all([
        fetch('/api/admin/drivers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/testimonials', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (dRes.ok) setDrivers(await dRes.json());
      if (bRes.ok) {
        const bd = await bRes.json();
        setBookings(Array.isArray(bd) ? bd : (bd.bookings || []));
      }
      if (tRes.ok) setTestimonials(await tRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics per driver
  const performanceData = drivers.map(driver => {
    // 1. Trips
    const driverBookings = bookings.filter(b => b.driverId === driver.id && b.status?.toLowerCase() === 'completed');
    const trips = driverBookings.length;
    
    // 2. Ratings (from testimonials that match bookingIds of this driver)
    const driverBookingIds = driverBookings.map(b => b.bookingId);
    const driverReviews = testimonials.filter(r => driverBookingIds.includes(r.bookingId));
    const avgRating = driverReviews.length > 0 
      ? driverReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / driverReviews.length
      : 0;

    return {
      id: driver.id,
      name: driver.name,
      Trips: trips,
      Rating: Number(avgRating.toFixed(1)),
      Reviews: driverReviews.length
    };
  }).sort((a, b) => b.Trips - a.Trips);

  const topDriver = performanceData[0] || null;
  const avgSystemRating = performanceData.filter(p => p.Rating > 0).length > 0
    ? (performanceData.reduce((s, p) => s + p.Rating, 0) / performanceData.filter(p => p.Rating > 0).length).toFixed(1)
    : '0.0';

  if (loading) {
    return <div className="p-8 text-center text-slate-500">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{isAr ? 'أداء السائقين' : 'Driver Performance'}</h1>
          <p className="text-slate-500 text-sm mt-1">{isAr ? 'مراقبة رحلات وتقييمات السائقين' : 'Monitor driver trips and ratings'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{isAr ? 'إجمالي السائقين' : 'Total Drivers'}</p>
            <h3 className="text-2xl font-bold text-slate-900">{drivers.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <Car size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{isAr ? 'الرحلات المكتملة' : 'Completed Trips'}</p>
            <h3 className="text-2xl font-bold text-slate-900">{performanceData.reduce((s, d) => s + d.Trips, 0)}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{isAr ? 'متوسط التقييم' : 'Average Rating'}</p>
            <h3 className="text-2xl font-bold text-slate-900">{avgSystemRating}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trips Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
            {isAr ? 'الرحلات لكل سائق' : 'Trips per Driver'}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData.slice(0, 10)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} angle={-45} textAnchor="end" height={60} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Trips" radius={[4, 4, 0, 0]}>
                  {performanceData.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ratings Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            {isAr ? 'تقييمات السائقين' : 'Driver Ratings'}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData.filter(p => p.Rating > 0).slice(0, 10)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="Rating" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

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
                <tr key={driver.id} onClick={() => setSelectedDriver(driver)} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer">
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
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg">{b.fare ? `SAR ${b.fare}` : 'VIP Service'}</span>
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
}
