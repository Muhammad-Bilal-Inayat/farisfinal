import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Edit3, Trash2, CheckCircle2, AlertCircle, X, Key, UserCheck, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: string;
  status: string;
  lastLogin?: string;
  createdAt?: string;
}

export default function UsersAdmin() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setPassword('');
    setRole('admin');
    setStatus('active');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (u: AdminUser) => {
    setEditingUser(u);
    setUsername(u.username);
    setName(u.name || '');
    setPassword('');
    setRole(u.role || 'admin');
    setStatus(u.status || 'active');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setError('');

    try {
      const payload: any = { username, name, role, status };
      if (password) payload.password = password;

      let url = '/api/admin/users';
      let method = 'POST';
      if (editingUser) {
        url = `/api/admin/users/${editingUser.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(isAr ? 'تم حفظ المستخدم بنجاح' : 'User saved successfully');
        setModalOpen(false);
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(data.error || (isAr ? 'حدث خطأ' : 'An error occurred'));
      }
    } catch (err) {
      setError(isAr ? 'فشل الاتصال بالخادم' : 'Server connection error');
    }
  };

  const handleDelete = async (id: number, uname: string) => {
    if (uname === 'vip123') {
      alert(isAr ? 'لا يمكن حذف حساب المسؤول الرئيسي (Master Admin)' : 'Cannot delete the primary Master Admin account');
      return;
    }
    if (!confirm(isAr ? `هل أنت متأكد من حذف المستخدم ${uname}؟` : `Are you sure you want to delete user ${uname}?`)) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (e) {
      alert('Error deleting user');
    }
  };

  const roleBadgeColor = (r: string) => {
    return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-[var(--color-saudi-green)]" size={24} />
            <span>{isAr ? 'إدارة حسابات الإدارة العامة (Master Admin)' : 'Master Admin Accounts & Security'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr ? 'إدارة حسابات الإدارة العامة مع صلاحيات التحكم الكامل بالنظام وقاعدة البيانات' : 'Strict Master Admin access enforcement for complete system and database operations'}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={16} />
          <span>{isAr ? 'إضافة مسؤول عام جديد' : 'Add Master Admin'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-700" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-4">Name / Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No admin users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{u.name || u.username}</div>
                      <div className="text-slate-400 text-[11px]">@{u.username}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${roleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{u.status || 'active'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 text-right rtl:text-left space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold"
                        title="Edit User"
                      >
                        <Edit3 size={14} />
                      </button>
                      {u.username !== 'vip123' && (
                        <button
                          onClick={() => handleDelete(u.id, u.username)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Shield size={18} className="text-[var(--color-luxury-gold)]" />
                <span>{editingUser ? (isAr ? 'تعديل بيانات المسؤول' : 'Edit Admin User') : (isAr ? 'إضافة مسؤول جديد' : 'Create Admin User')}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                  placeholder="e.g. Ahmed Al-Mutairi"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none font-mono"
                  placeholder="username123"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                  placeholder="••••••••"
                  {...(!editingUser ? { required: true } : {})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Enforced Role</label>
                  <select
                    value={role}
                    onChange={e => setRole('master_admin')}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none bg-slate-50 font-bold cursor-not-allowed"
                    disabled
                  >
                    <option value="master_admin">Master Admin (Full System Control)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none bg-white font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
