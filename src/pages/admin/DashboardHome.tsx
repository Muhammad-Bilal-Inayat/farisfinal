import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Users, Calendar, Banknote, Car, Clock, 
  CheckCircle2, AlertCircle, ArrowUpRight, MessageSquare, Download,
  Phone, Eye, ShieldCheck, MapPin, Zap, RefreshCw, Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DashboardHome({ setActiveTab }: { setActiveTab?: (t: any) => void }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const [bRes, vRes, mRes] = await Promise.all([
        fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/vehicles', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/messages', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (bRes.ok) {
        const d = await bRes.json();
        setBookings(Array.isArray(d) ? d : (d.bookings || []));
      }
      if (vRes.ok) setVehicles(await vRes.json());
      if (mRes.ok) setMessages(await mRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter bookings based on selected timeframe
  const filteredBookings = bookings.filter(b => {
    if (timeFilter === 'all') return true;
    if (!b.createdAt && !b.date) return true;
    const itemDate = new Date(b.createdAt || b.date);
    const now = new Date();
    if (timeFilter === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return itemDate >= sevenDaysAgo;
    }
    if (timeFilter === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return itemDate >= thirtyDaysAgo;
    }
    return true;
  });

  // Calculate Metrics
  const totalRevenue = filteredBookings
    .filter(b => b.status?.toLowerCase() !== 'cancelled')
    .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const totalBookingsCount = filteredBookings.length;
  const confirmedCount = filteredBookings.filter(b => b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'completed').length;
  const pendingCount = filteredBookings.filter(b => b.status?.toLowerCase() === 'pending' || !b.status).length;
  const activeVehiclesCount = vehicles.filter(v => v.status !== 'archived').length;
  const unreadMessagesCount = messages.filter(m => m.status === 'Unread').length;

  // Chart: Monthly / Recent Revenue
  const revenueByMonth: Record<string, number> = {};
  filteredBookings.forEach(b => {
    const rawDate = b.date || b.createdAt || '';
    const key = rawDate.length >= 7 ? rawDate.substring(0, 7) : 'Recent';
    revenueByMonth[key] = (revenueByMonth[key] || 0) + (Number(b.price) || 0);
  });
  const revenueChartData = Object.entries(revenueByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, Total]) => ({ name, Total }));

  // Status Distribution Chart
  const statusCounts = {
    Confirmed: filteredBookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
    Completed: filteredBookings.filter(b => b.status?.toLowerCase() === 'completed').length,
    Pending: pendingCount,
    Cancelled: filteredBookings.filter(b => b.status?.toLowerCase() === 'cancelled').length,
  };
  const statusPieData = [
    { name: isAr ? 'مؤكد' : 'Confirmed', value: statusCounts.Confirmed, color: '#059669' },
    { name: isAr ? 'مكتمل' : 'Completed', value: statusCounts.Completed, color: '#10b981' },
    { name: isAr ? 'قيد الانتظار' : 'Pending', value: statusCounts.Pending, color: '#f59e0b' },
    { name: isAr ? 'ملغي' : 'Cancelled', value: statusCounts.Cancelled, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Export CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert(isAr ? 'لا توجد بيانات للتصدير' : 'No bookings to export');
      return;
    }
    const headers = ['Booking ID', 'Customer Name', 'Phone', 'Pickup', 'Destination', 'Date', 'Time', 'Vehicle', 'Price (SAR)', 'Status'];
    const rows = bookings.map(b => [
      b.bookingId || b.id,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${(b.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(b.pickup || '').replace(/"/g, '""')}"`,
      `"${(b.destination || '').replace(/"/g, '""')}"`,
      b.date || '',
      b.time || '',
      `"${(b.vehicleNameSnapshot || '').replace(/"/g, '""')}"`,
      b.price || 0,
      b.status || 'Pending'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VIP_Bookings_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-[var(--color-saudi-emerald)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">{isAr ? 'جاري تحميل لوحة التحكم...' : 'Loading executive dashboard...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-[var(--color-dark-charcoal)] via-[var(--color-saudi-emerald)] to-[var(--color-dark-charcoal)] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-[var(--color-saudi-emerald)]/50">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={16} />
            <span>{isAr ? 'مركز العمليات المباشرة وإدارة الأسطول' : 'Real-Time Dispatch & Operations Center'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isAr ? 'أهلاً بك في لوحة الإدارة التنفيذية' : 'Executive Transportation Overview'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-xl">
            {isAr ? 'متابعة حية للحجوزات، الإيرادات، جاهزية الأسطول، وخدمة ضيوف الرحمن على مدار الساعة.' : 'Live tracking of Umrah transfers, gross revenues, fleet capacity, and guest inquiries.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter Pill */}
          <div className="bg-black/30 p-1 rounded-xl border border-white/10 flex items-center text-xs font-bold">
            <button 
              onClick={() => setTimeFilter('all')} 
              className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'all' ? 'bg-white text-[var(--color-dark-charcoal)] shadow-sm' : 'text-white/80 hover:text-white'}`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button 
              onClick={() => setTimeFilter('month')} 
              className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'month' ? 'bg-white text-[var(--color-dark-charcoal)] shadow-sm' : 'text-white/80 hover:text-white'}`}
            >
              {isAr ? '٣٠ يوماً' : '30 Days'}
            </button>
            <button 
              onClick={() => setTimeFilter('week')} 
              className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'week' ? 'bg-white text-[var(--color-dark-charcoal)] shadow-sm' : 'text-white/80 hover:text-white'}`}
            >
              {isAr ? '٧ أيام' : '7 Days'}
            </button>
          </div>

          <button 
            onClick={handleExportCSV}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>{isAr ? 'تصدير تقرير CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Quick Operations Bar */}
      </div>

      {/* Quick Operations Shortcut Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab && setActiveTab('settings')}
          className="p-3.5 bg-white hover:bg-amber-50 rounded-xl border border-amber-200/80 shadow-xs flex items-center gap-3 text-left transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-700 group-hover:scale-105 transition-transform">
            <Zap size={18} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">{isAr ? 'الذاكرة المؤقتة (الكاش)' : 'Purge Cache'}</div>
            <div className="text-[10px] text-slate-500">{isAr ? 'تحديث فوري للأسعار' : 'Instant live sync'}</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab('rates')}
          className="p-3.5 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 text-left transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-700 group-hover:scale-105 transition-transform">
            <Banknote size={18} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">{isAr ? 'تعديل الأسعار' : 'Trip Rates'}</div>
            <div className="text-[10px] text-slate-500">{isAr ? '١٧ مسار لـ ٩ سيارات' : '17 routes pricing'}</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab('vehicles')}
          className="p-3.5 bg-white hover:bg-blue-50 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 text-left transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-lg bg-blue-500/15 text-blue-700 group-hover:scale-105 transition-transform">
            <Car size={18} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">{isAr ? 'إدارة الأسطول' : 'Fleet Dispatch'}</div>
            <div className="text-[10px] text-slate-500">{isAr ? `${activeVehiclesCount} سيارة نشطة` : `${activeVehiclesCount} luxury cars`}</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab('settings')}
          className="p-3.5 bg-white hover:bg-purple-50 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 text-left transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-lg bg-purple-500/15 text-purple-700 group-hover:scale-105 transition-transform">
            <Phone size={18} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">{isAr ? 'رقم الواتساب الموحد' : 'WhatsApp Hotline'}</div>
            <div className="text-[10px] text-slate-500">{isAr ? 'الرد الفوري على الضيوف' : 'Dispatcher settings'}</div>
          </div>
        </button>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div onClick={() => setActiveTab && setActiveTab("bookings")} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </span>
            <div className="p-2.5 rounded-xl bg-gray-50 text-[var(--color-saudi-emerald)]">
              <Banknote size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalRevenue.toLocaleString()} <span className="text-sm font-bold text-[var(--color-saudi-green)]">{t('sar')}</span>
            </h3>
            <p className="text-xs text-gray-700 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>{isAr ? 'حساب دقيق لجميع المسارات المؤكدة' : 'Calculated from confirmed transfers'}</span>
            </p>
          </div>
        </div>

        {/* Total Bookings */}
        <div onClick={() => setActiveTab && setActiveTab("bookings")} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'إجمالي الحجوزات' : 'Total Bookings'}
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalBookingsCount}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="font-bold text-gray-600">{confirmedCount} {isAr ? 'مؤكد' : 'Confirmed'}</span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-amber-600">{pendingCount} {isAr ? 'انتظار' : 'Pending'}</span>
            </div>
          </div>
        </div>

        {/* Active Fleet */}
        <div onClick={() => setActiveTab && setActiveTab("bookings")} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'الأسطول النشط' : 'Active Fleet'}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Car size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeVehiclesCount} <span className="text-sm font-semibold text-slate-500">{isAr ? 'سيارات' : 'Vehicles'}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {isAr ? 'جاهزة للنقل الفوري والتنفيذي' : 'Ready for private chauffeur dispatch'}
            </p>
          </div>
        </div>

        {/* Inquiries / Messages */}
        <div onClick={() => setActiveTab && setActiveTab("bookings")} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'رسائل واستفسارات' : 'Inquiries & Messages'}
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {messages.length}
            </h3>
            <p className="text-xs font-bold mt-1 text-purple-700 flex items-center gap-1">
              <span>{unreadMessagesCount} {isAr ? 'رسائل جديدة بانتظار الرد' : 'Unread inquiries'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? 'اتجاهات الإيرادات والنمو' : 'Monthly Revenue Trend'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? 'توزيع المبيعات التقديرية بالريال السعودي' : 'Gross booking revenue distribution in SAR'}
              </p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData.length ? revenueChartData : [{ name: 'Current', Total: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={v => `${v} ${t('sar')}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: any) => [`${v} ${t('sar')}`, isAr ? 'الإيراد' : 'Revenue']}
                />
                <Bar dataKey="Total" fill="var(--color-saudi-emerald)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              {isAr ? 'توزيع حالات الحجوزات' : 'Booking Status Breakdown'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isAr ? 'نسب الحجوزات المؤكدة والملغاة وقيد الانتظار' : 'Current lifecycle of guest transfers'}
            </p>

            <div className="h-[200px] w-full flex items-center justify-center">
              {statusPieData.length === 0 ? (
                <div className="text-xs text-slate-400">{isAr ? 'لا توجد بيانات' : 'No data'}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--color-saudi-emerald)]" />
              <span className="font-medium text-slate-600">{isAr ? 'مؤكد' : 'Confirmed'}: <strong className="text-slate-900">{statusCounts.Confirmed}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="font-medium text-slate-600">{isAr ? 'مكتمل' : 'Completed'}: <strong className="text-slate-900">{statusCounts.Completed}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="font-medium text-slate-600">{isAr ? 'انتظار' : 'Pending'}: <strong className="text-slate-900">{statusCounts.Pending}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="font-medium text-slate-600">{isAr ? 'ملغي' : 'Cancelled'}: <strong className="text-slate-900">{statusCounts.Cancelled}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Mini Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {isAr ? 'أحدث طلبات الحجز المباشرة' : 'Latest Transfer Requests'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr ? 'آخر الحجوزات الواردة من الموقع جاهزة للتأكيد والمتابعة' : 'Recent bookings received via the website ready for dispatch'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-dark-charcoal)] text-[11px] uppercase font-bold tracking-wider text-white border-b border-gray-800">
                <th className="p-4">{isAr ? 'رقم الحجز والعميل' : 'Booking / Customer'}</th>
                <th className="p-4">{isAr ? 'المسار' : 'Route'}</th>
                <th className="p-4">{isAr ? 'السيارة والتاريخ' : 'Vehicle & Date'}</th>
                <th className="p-4">{isAr ? 'السعر' : 'Fare'}</th>
                <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-4 text-right">{isAr ? 'تواصل' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm font-medium divide-y divide-gray-200 text-[var(--color-dark-charcoal)]">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {isAr ? 'لا توجد حجوزات حتى الآن' : 'No bookings recorded yet.'}
                  </td>
                </tr>
              ) : (
                bookings.slice(0, 5).map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{b.customerName || 'Guest'}</div>
                      <div className="text-xs text-slate-500">{b.bookingId || `ID: ${b.id}`} • {b.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-semibold text-[var(--color-dark-charcoal)] flex items-center gap-1">
                        <MapPin size={12} className="text-gray-600 shrink-0" />
                        <span>{b.pickup || 'JED Airport'} → {b.destination || 'Makkah'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 text-xs">{b.vehicleNameSnapshot || 'VIP Vehicle'}</div>
                      <div className="text-xs text-slate-500">{b.date} {b.time && `• ${b.time}`}</div>
                    </td>
                    <td className="p-4 font-bold text-[var(--color-saudi-emerald)]">
                      {b.price} {t('sar')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                        b.status?.toLowerCase() === 'confirmed' ? 'bg-[var(--color-saudi-green)] text-white' :
                        b.status?.toLowerCase() === 'completed' ? 'bg-blue-600 text-white' :
                        b.status?.toLowerCase() === 'cancelled' ? 'bg-red-600 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {b.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {b.customerPhone && (
                        <a 
                          href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Phone size={12} />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
