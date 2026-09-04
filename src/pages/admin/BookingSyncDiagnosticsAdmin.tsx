import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Trash2, 
  Database, ShieldCheck, Clock, FileText, Search, ArrowUpRight, Check, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BookingSyncDiagnosticsAdmin() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  const fetchLogs = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/booking-sync-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch booking sync logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Poll every 10s for real-time tracking
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSimulateSync = async (testType: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setSimulating(true);
    try {
      const res = await fetch('/api/admin/booking-sync-logs/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ testType })
      });
      if (res.ok) {
        const data = await res.json();
        triggerToast(
          isAr 
            ? `تم تشغيل محاكاة المزامنة (${testType}) بنجاح` 
            : `Sync simulation test (${testType}) completed successfully`
        );
        fetchLogs();
      }
    } catch (e) {
      alert("Failed to run sync simulation");
    } finally {
      setSimulating(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm(isAr ? 'هل أنت متأكد من مسح جميع سجلات التشخيص؟' : 'Are you sure you want to clear all sync diagnostic logs?')) return;
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/booking-sync-logs', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast(isAr ? 'تم مسح سجلات التشخيص بنجاح' : 'Diagnostic logs cleared successfully');
        fetchLogs();
      }
    } catch (e) {
      alert("Failed to clear logs");
    }
  };

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'SUCCESS').length,
    failed: logs.filter(l => l.status === 'FAILED_WRITE').length,
    conflicts: logs.filter(l => l.status === 'OVERWRITE_CONFLICT').length,
  };

  const filteredLogs = logs.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchId = (l.bookingId || '').toLowerCase().includes(q);
      const matchAction = (l.action || '').toLowerCase().includes(q);
      const matchErr = (l.errorDetails || '').toLowerCase().includes(q);
      if (!matchId && !matchAction && !matchErr) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[var(--color-dark-charcoal)] to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
            <Activity size={13} className="animate-pulse" />
            <span>{isAr ? 'مراقبة المزامنة الفورية وقاعدة البيانات' : 'Real-Time Firestore & DB Sync Monitor'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isAr ? 'تشخيص ومتابعة مزامنة الحجوزات' : 'Booking Management Sync Diagnostics'}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            {isAr 
              ? 'تتبع عمليات إرسال الحجوزات، التحقق من التطابق بين واجهة المستخدم وقاعدة البيانات/Firestore، واكتشاف أخطاء الكتابة أو تضارب النسخ فوراً.' 
              : 'Explicitly tracks real-time synchronization between user booking submissions and database/Firestore collections, identifying failed writes and overwrite conflicts.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleSimulateSync('success')}
            disabled={simulating}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={15} />
            <span>{isAr ? 'محاكاة مزامنة ناجحة' : 'Test Sync (Success)'}</span>
          </button>
          <button
            onClick={() => handleSimulateSync('overwrite_conflict')}
            disabled={simulating}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <AlertTriangle size={15} />
            <span>{isAr ? 'محاكاة تضارب نسخ' : 'Test Conflict'}</span>
          </button>
          <button
            onClick={fetchLogs}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/15"
            title={isAr ? 'تحديث السجلات' : 'Refresh Logs'}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'إجمالي محاولات المزامنة' : 'Total Sync Operations'}</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
            <Database size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{isAr ? 'عمليات ناجحة' : 'Successful Writes'}</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.success}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-red-600 uppercase tracking-wider">{isAr ? 'أخطاء الكتابة' : 'Failed Writes'}</div>
            <div className="text-2xl font-extrabold text-red-700 mt-1">{stats.failed}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <XCircle size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">{isAr ? 'تضارب النسخ' : 'Overwrite Conflicts'}</div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">{stats.conflicts}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث برقم الحجز أو الحدث...' : 'Search booking ref or action...'}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 text-slate-800 w-64 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['all', 'SUCCESS', 'FAILED_WRITE', 'OVERWRITE_CONFLICT'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === st 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? (isAr ? 'الكل' : 'All') : st}
              </button>
            ))}
          </div>
        </div>

        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} />
            <span>{isAr ? 'مسح السجلات' : 'Clear Logs'}</span>
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-dark-charcoal)] text-[11px] uppercase font-bold tracking-wider text-white border-b border-gray-800">
                <th className="p-4">{isAr ? 'رقم الحجز / المرجع' : 'Booking Reference'}</th>
                <th className="p-4">{isAr ? 'نوع الحدث' : 'Action Type'}</th>
                <th className="p-4">{isAr ? 'حالة المزامنة' : 'Sync Status'}</th>
                <th className="p-4">{isAr ? 'زمن الاستجابة' : 'Latency'}</th>
                <th className="p-4">{isAr ? 'تفاصيل الخطأ أو التضارب' : 'Error / Conflict Details'}</th>
                <th className="p-4">{isAr ? 'التاريخ والوقت' : 'Timestamp'}</th>
                <th className="p-4 text-right">{isAr ? 'بيانات الحمولة' : 'Payload'}</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm font-medium divide-y divide-gray-200 text-[var(--color-dark-charcoal)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[var(--color-saudi-emerald)] border-t-transparent rounded-full animate-spin" />
                      <span>{isAr ? 'جاري تحميل سجلات التشخيص...' : 'Loading sync diagnostic logs...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck size={32} className="text-emerald-500" />
                      <span className="font-semibold">{isAr ? 'لا توجد سجلات مزامنة مطابقة' : 'No matching sync logs found'}</span>
                      <span className="text-xs text-slate-400">{isAr ? 'جميع الحجوزات متزامنة تماماً دون أي أخطاء أو تضارب.' : 'All bookings are fully synchronized with zero write errors or conflicts.'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-extrabold text-[var(--color-saudi-emerald)]">
                      {log.bookingId}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-700">
                      <span className="bg-slate-100 px-2 py-1 rounded-md font-mono">{log.action}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 shadow-2xs ${
                        log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        log.status === 'OVERWRITE_CONFLICT' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-red-100 text-red-900 border border-red-300'
                      }`}>
                        {log.status === 'SUCCESS' && <Check size={12} />}
                        {log.status === 'OVERWRITE_CONFLICT' && <AlertTriangle size={12} />}
                        {log.status === 'FAILED_WRITE' && <X size={12} />}
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-600">
                      {log.latencyMs} ms
                    </td>
                    <td className="p-4 text-xs text-slate-600 max-w-xs truncate" title={log.errorDetails || ''}>
                      {log.errorDetails ? (
                        <span className="text-red-600 font-medium">{log.errorDetails}</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">{isAr ? 'مزامنة سليمة 100%' : 'Clean synchronized write'}</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      {log.payload ? (
                        <button
                          onClick={() => setSelectedPayload(log)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText size={13} />
                          <span>{isAr ? 'عرض' : 'Inspect'}</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspection Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isAr ? 'تفاصيل حمولة المزامنة' : 'Sync Payload Inspector'}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Ref: {selectedPayload.bookingId}</p>
              </div>
              <button
                onClick={() => setSelectedPayload(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-bold">Status</span>
                  <span className="font-bold text-slate-800">{selectedPayload.status}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-bold">Latency</span>
                  <span className="font-bold text-slate-800">{selectedPayload.latencyMs} ms</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">JSON Payload Snapshot:</label>
                <pre className="bg-slate-900 text-emerald-400 text-xs p-3.5 rounded-xl overflow-x-auto font-mono max-h-64 leading-relaxed">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedPayload.payload), null, 2);
                    } catch (e) {
                      return selectedPayload.payload;
                    }
                  })()}
                </pre>
              </div>

              {selectedPayload.errorDetails && (
                <div>
                  <label className="text-xs font-bold text-red-600 block mb-1">Error / Conflict Description:</label>
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 font-medium">
                    {selectedPayload.errorDetails}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-2 bg-[var(--color-saudi-emerald)] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[var(--color-saudi-green)] cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close Inspector'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
