import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Search, Filter, Calendar, User, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActivityLog {
  id: number;
  userId?: number;
  username?: string;
  name?: string;
  role?: string;
  action: string;
  module: string;
  recordId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function ActivityAdmin() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const fetchLogs = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchSearch = !search || 
      (l.action && l.action.toLowerCase().includes(search.toLowerCase())) ||
      (l.description && l.description.toLowerCase().includes(search.toLowerCase())) ||
      (l.username && l.username.toLowerCase().includes(search.toLowerCase())) ||
      (l.name && l.name.toLowerCase().includes(search.toLowerCase()));
    
    const matchRole = !roleFilter || l.role === roleFilter;
    const matchModule = !moduleFilter || l.module === moduleFilter;

    return matchSearch && matchRole && matchModule;
  });

  const roleBadgeColor = (r?: string) => {
    switch (r) {
      case 'master_admin': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'admin': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'secondary_admin': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'manager': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'editor': return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'driver': return 'bg-slate-100 text-slate-800 border-slate-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="text-[var(--color-saudi-green)]" size={24} />
            <span>{isAr ? 'سجل نشاط النظام والعمليات (Master Activity Log)' : 'Master Activity & Audit Logs'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr ? 'تتبع دقيق لكافة عمليات المشرفين، السائقين، وتعديلات النظام' : 'Comprehensive tracking of all admin, manager, driver, and system operations'}
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-slate-300"
        >
          <RefreshCw size={14} />
          <span>{isAr ? 'تحديث السجل' : 'Refresh Logs'}</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={16} className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث في النشاطات...' : 'Search activity action or description...'}
            className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none font-bold text-slate-700"
        >
          <option value="">All Roles</option>
          <option value="master_admin">Master Admin</option>
          <option value="admin">Admin</option>
          <option value="secondary_admin">Secondary Admin</option>
          <option value="manager">Manager</option>
          <option value="editor">Editor</option>
          <option value="driver">Driver</option>
        </select>

        <select
          value={moduleFilter}
          onChange={e => setModuleFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none font-bold text-slate-700"
        >
          <option value="">All Modules</option>
          <option value="Auth">Auth & Login</option>
          <option value="Orders">Orders & Bookings</option>
          <option value="Drivers">Drivers</option>
          <option value="Vehicles">Vehicles</option>
          <option value="Users">Users Management</option>
          <option value="Settings">Settings</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action / Module</th>
                <th className="p-4">Description</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading activity logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No activity logs found.</td></tr>
              ) : (
                filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{l.name || l.username || 'System'}</div>
                      <div className="text-slate-400 text-[10px]">@{l.username || 'system'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${roleBadgeColor(l.role)}`}>
                        {l.role || 'system'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{l.action}</span>
                      <span className="text-[10px] font-semibold text-[var(--color-saudi-green)] bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {l.module} {l.recordId ? `#${l.recordId}` : ''}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate" title={l.description || ''}>
                      {l.description || '-'}
                    </td>
                    <td className="p-4 font-mono text-slate-400 text-[10px]">
                      {l.ipAddress || 'unknown'}
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
