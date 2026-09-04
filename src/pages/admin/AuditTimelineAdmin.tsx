import React, { useState, useEffect } from 'react';
import { Clock, User, ShieldCheck, Car, Database, ArrowRight, RefreshCw, AlertCircle, Filter, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AuditLogEntry {
  id: number;
  userId?: number;
  username?: string;
  action: string;
  module: string;
  recordId?: string;
  changes?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AuditTimelineAdmin() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAuditLogs = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit_logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching audit logs timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesSearch = !searchQuery || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.username && log.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.recordId && log.recordId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.changes && log.changes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesModule && matchesSearch;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (action.includes('ARCHIVE') || action.includes('DELETE')) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
            <Clock className="text-[var(--color-saudi-green)]" size={26} />
            <span>{isAr ? 'الخط الزمني لتعديلات الأسطول والنشاطات (Audit Timeline)' : 'Fleet & Admin Audit Timeline'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr ? 'تتبع زمني تفاعلي لمعرفة من قام بتعديل أو إضافة مركبة ومتى تم ذلك لمنع أي تعارض في البيانات.' : 'Chronological visualization tracking exact admin actions, vehicle updates, and timestamps to debug data changes.'}
          </p>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-slate-300"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>{isAr ? 'تحديث الخط الزمني' : 'Refresh Timeline'}</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search size={16} className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في السجلات (المشرف، الإجراء، رقم المركبة)...' : 'Search action, username, record ID...'}
            className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">{isAr ? 'جميع الأقسام' : 'All Modules'}</option>
            <option value="vehicles">Vehicles & Fleet</option>
            <option value="bookings">Bookings & Orders</option>
            <option value="settings">Settings & Config</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-medium">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[var(--color-saudi-green)]" />
            Loading audit timeline data...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">{isAr ? 'لا توجد سجلات مطابقة' : 'No Audit Logs Recorded Yet'}</h3>
            <p className="text-xs text-slate-500 mt-1">When admins modify vehicles, prices, or settings, their actions will appear here chronologically.</p>
          </div>
        ) : (
          <div className="relative border-s-2 border-slate-200 ml-3 sm:ml-6 rtl:mr-3 rtl:ml-0 rtl:border-s-0 rtl:border-r-2 pl-6 sm:pl-8 rtl:pr-6 rtl:pl-0 space-y-8">
            {filteredLogs.map((log, index) => (
              <div key={log.id || index} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] rtl:-right-[31px] rtl:left-auto top-1 w-6 h-6 rounded-full bg-[var(--color-dark-charcoal)] border-4 border-white shadow-md flex items-center justify-center text-[var(--color-luxury-gold)] text-[10px]">
                  <Car size={11} />
                </div>

                <div className="bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs transition-all hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                        Module: {log.module} {log.recordId ? `(ID: #${log.recordId})` : ''}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px]">
                        {(log.username || 'A').charAt(0).toUpperCase()}
                      </div>
                      <span>Admin: <strong className="text-slate-900 font-bold">@{log.username || 'admin'}</strong></span>
                      {log.ipAddress && <span className="text-slate-400 font-mono text-[10px]">IP: {log.ipAddress}</span>}
                    </div>

                    {log.changes && (
                      <div className="w-full bg-slate-900 text-emerald-300 font-mono text-[11px] p-3 rounded-xl overflow-x-auto mt-2 border border-slate-800">
                        <span className="text-slate-500 block text-[10px] mb-1">PAYLOAD / CHANGES:</span>
                        <code>{log.changes}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
