import React, { useState, useEffect } from 'react';
import { Save, Lock, Code, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CodingAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [isLocked, setIsLocked] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    adsenseEnabled: 'false',
    adsensePublisherId: '',
    adsenseSandbox: 'false',
    adsenseHeaderSlot: '',
    adsenseArticleSlot: '',
    adsenseSidebarSlot: '',
    adsenseFooterSlot: ''
  });

  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    if (!isLocked) {
      fetchSettings();
    }
  }, [isLocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'mbi786' && password === 'mbi786') {
      setIsLocked(false);
    } else {
      setToast({ msg: 'Invalid credentials', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          adsenseEnabled: data.adsenseEnabled || 'false',
          adsensePublisherId: data.adsensePublisherId || '',
          adsenseSandbox: data.adsenseSandbox || 'false',
          adsenseHeaderSlot: data.adsenseHeaderSlot || '',
          adsenseArticleSlot: data.adsenseArticleSlot || '',
          adsenseSidebarSlot: data.adsenseSidebarSlot || '',
          adsenseFooterSlot: data.adsenseFooterSlot || ''
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setToast({ msg: 'AdSense settings saved successfully', type: 'success' });
      } else {
        setToast({ msg: 'Failed to save', type: 'error' });
      }
    } catch (e) {
      setToast({ msg: 'Failed to save', type: 'error' });
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        {toast && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg z-50 transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
            {toast.msg}
          </div>
        )}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Restricted Access</h2>
          <p className="text-sm text-slate-500 mb-6">This section is restricted. Please enter the master credentials to access coding & adsense configuration.</p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Shield size={18} />
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg z-50 transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <Code className="text-blue-600" size={28} />
            AdSense Account & Ad Unit Placements
          </h1>
          <p className="text-slate-500 text-sm mt-1">Input your personal Google AdSense Publisher ID and customize your display ad slots.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          Save Configurations
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8">
        
        {/* Enable Toggle */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <input 
            type="checkbox" 
            id="adsenseEnabled"
            checked={settings.adsenseEnabled === 'true'}
            onChange={e => setSettings({...settings, adsenseEnabled: e.target.checked ? 'true' : 'false'})}
            className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="adsenseEnabled" className="font-bold text-slate-900 cursor-pointer">Enable AdSense Monetization</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Publisher ID */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">ADSENSE PUBLISHER ID <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              placeholder="ca-pub-9876543210123456"
              value={settings.adsensePublisherId}
              onChange={e => setSettings({...settings, adsensePublisherId: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-2">Find this in your Google AdSense Dashboard → <strong>Account</strong> → <strong>Settings</strong> → <strong>Account Information</strong>.</p>
          </div>

          {/* Sandbox mode */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">ADSENSE PREVIEW BADGES IN SANDBOX</label>
            <div className="flex items-start gap-3 mt-3">
              <input 
                type="checkbox" 
                id="adsenseSandbox"
                checked={settings.adsenseSandbox === 'true'}
                onChange={e => setSettings({...settings, adsenseSandbox: e.target.checked ? 'true' : 'false'})}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer mt-0.5"
              />
              <label htmlFor="adsenseSandbox" className="text-sm text-slate-600 cursor-pointer">
                Show visual slot placeholders (turn OFF for live production ads)
              </label>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slots */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">HEADER LEADERBOARD AD SLOT ID</label>
            <input 
              type="text" 
              placeholder="1234567890"
              value={settings.adsenseHeaderSlot}
              onChange={e => setSettings({...settings, adsenseHeaderSlot: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">IN-ARTICLE CONTENT AD SLOT ID</label>
            <input 
              type="text" 
              placeholder="2345678901"
              value={settings.adsenseArticleSlot}
              onChange={e => setSettings({...settings, adsenseArticleSlot: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">STICKY SIDEBAR AD SLOT ID</label>
            <input 
              type="text" 
              placeholder="3456789012"
              value={settings.adsenseSidebarSlot}
              onChange={e => setSettings({...settings, adsenseSidebarSlot: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">FOOTER BANNER AD SLOT ID</label>
            <input 
              type="text" 
              placeholder="4567890123"
              value={settings.adsenseFooterSlot}
              onChange={e => setSettings({...settings, adsenseFooterSlot: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
            />
          </div>
        </div>

        <hr className="border-slate-100" />

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span>ADSENSE CODE (AUTO-INJECTED IN &lt;HEAD&gt;)</span>
            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium">
              <Code size={14} /> Copy Script Tag
            </button>
          </label>
          <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
            <code className="text-emerald-400 text-sm whitespace-pre">
              {`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsensePublisherId || 'ca-pub-9876543210123456'}" crossorigin="anonymous"></script>`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
