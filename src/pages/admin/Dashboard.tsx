import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Car, Map, Settings, Monitor, MessageSquare, LogOut, 
  LayoutDashboard, Banknote, Globe, ExternalLink, Menu, X, 
  RefreshCw, ShieldCheck, CheckCircle2, AlertCircle, Trash2, Zap, Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BookingsAdmin from './BookingsAdmin';
import ManageVehicles from './ManageVehicles';
import RoutesAdmin from './RoutesAdmin';
import CustomersAdmin from './CustomersAdmin';
import MessagesAdmin from './MessagesAdmin';
import SettingsAdmin from './SettingsAdmin';
import DashboardHome from './DashboardHome';
import RatesAdmin from "./RatesAdmin";
import PageBuilderAdmin from "./PageBuilderAdmin";
import ReviewsAdmin from "./ReviewsAdmin";
import DriversAdmin from "./DriversAdmin";
import UsersAdmin from './UsersAdmin';
import ActivityAdmin from './ActivityAdmin';
import DriverDashboard from './DriverDashboard';
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { Code, Eye, UserCheck, Activity } from 'lucide-react';
import { clearAppCache } from '../../utils/registerServiceWorker';


export default function AdminDashboard({ initialTab }: { initialTab?: string }) {
  const { t, i18n } = useTranslation();
  const getInitialTab = () => {
    if (initialTab) return initialTab;
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/admin/drivers')) return 'drivers';
      if (path.includes('/admin/orders') || path.includes('/admin/bookings')) return 'bookings';
      if (path.includes('/admin/vehicles')) return 'vehicles';
      if (path.includes('/admin/customers')) return 'customers';
    }
    return 'dashboard';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('adminUser');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheToast, setCacheToast] = useState<string | null>(null);

  const handleClearCache = async () => {
    const currentToken = localStorage.getItem('adminToken');
    if (!currentToken) return;
    setIsClearingCache(true);
    try {
      const res = await fetch('/api/admin/cache/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success) {
        // Clear Service Worker caches & local storage
        await clearAppCache();
        try {
          sessionStorage.clear();
          localStorage.removeItem('faris_site_settings');
          localStorage.removeItem('faris_whatsapp_settings');
        } catch (e) {}
        setCacheToast(i18n.language === 'ar' ? 'تم مسح الذاكرة المؤقتة بنجاح وتحديث النظام' : 'System, Service Worker & Server cache cleared successfully!');
        setRefreshKey(k => k + 1);
        fetchBadgeCounts();
        setTimeout(() => setCacheToast(null), 3500);
      }
    } catch (e) {
      setCacheToast(i18n.language === 'ar' ? 'حدث خطأ أثناء مسح الكاش' : 'Error clearing cache');
      setTimeout(() => setCacheToast(null), 3000);
    } finally {
      setIsClearingCache(false);
    }
  };

  // Fetch quick notification counts for badges
  const fetchBadgeCounts = async () => {
    const currentToken = localStorage.getItem('adminToken');
    if (!currentToken) return;
    try {
      const [bookingsRes, msgRes] = await Promise.all([
        fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
        fetch('/api/admin/messages', { headers: { 'Authorization': `Bearer ${currentToken}` } })
      ]);
      if (bookingsRes.status === 401 || msgRes.status === 401) {
        localStorage.removeItem('adminToken');
        setToken(null);
        return;
      }
      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        const pending = Array.isArray(bData) ? bData.filter((b: any) => b.status?.toLowerCase() === 'pending' || !b.status).length : 0;
        setPendingBookingsCount(pending);
      }
      if (msgRes.ok) {
        const mData = await msgRes.json();
        const unread = Array.isArray(mData) ? mData.filter((m: any) => m.status === 'Unread').length : 0;
        setUnreadMsgCount(unread);
      }
    } catch (e) {
      console.warn("Failed to fetch badge counts", e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBadgeCounts();
      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchBadgeCounts();
        }
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [token, refreshKey]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        if (data.user) {
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          setCurrentUser(data.user);
        } else {
          const fallbackUser = { role: username === 'vip123' ? 'master_admin' : 'admin', name: username };
          localStorage.setItem('adminUser', JSON.stringify(fallbackUser));
          setCurrentUser(fallbackUser);
        }
        setToken(data.token);
      } else {
        setLoginError(data.error || (i18n.language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
      }
    } catch (err) {
      setLoginError(i18n.language === 'ar' ? 'فشل الاتصال بالخادم' : 'Failed to connect to server');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setCurrentUser(null);
  };

  if (token && currentUser?.role === 'driver') {
    return <DriverDashboard onLogout={handleLogout} />;
  }

  if (!token) {
    return (
      <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-[var(--color-dark-charcoal)] via-slate-900 to-black flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-saudi-emerald)] text-[var(--color-luxury-gold)] shadow-lg mb-4">
              <ShieldCheck size={36} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-saudi-emerald)] tracking-tight">
              {i18n.language === 'ar' ? 'بوابة إدارة النقل VIP' : 'VIP Admin Portal'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {i18n.language === 'ar' ? 'لوحة التحكم والعمليات المباشرة' : 'Chauffeur Dispatch & Fleet Operations'}
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {i18n.language === 'ar' ? 'اسم المستخدم' : 'Username'}
              </label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:border-transparent transition-all outline-none" 
                placeholder="admin"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {i18n.language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:border-transparent transition-all outline-none" 
                placeholder="••••••••"
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>{i18n.language === 'ar' ? 'تسجيل الدخول الآمن' : 'Secure Login'}</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link to="/" className="hover:text-gray-700 flex items-center gap-1 font-semibold">
              ← {i18n.language === 'ar' ? 'العودة للموقع' : 'Back to Website'}
            </Link>
            <button 
              type="button"
              onClick={() => {
                const newLang = i18n.language === 'en' ? 'ar' : 'en';
                i18n.changeLanguage(newLang);
                document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = newLang;
              }}
              className="flex items-center gap-1 font-bold text-[var(--color-saudi-green)] hover:text-gray-700"
            >
              <Globe size={14} />
              {i18n.language === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navGroups = [
    {
      group: t('admin_main'),
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: t('admin_dashboard') },
        { id: 'bookings', icon: Calendar, label: t('admin_bookings'), badge: pendingBookingsCount },
        { id: 'customers', icon: Users, label: t('admin_customers') },
        { id: 'messages', icon: MessageSquare, label: t('admin_messages'), badge: unreadMsgCount }
      ]
    },
    {
      group: t('admin_fleet'),
      items: [
        { id: 'drivers', icon: UserCheck, label: i18n.language === 'ar' ? 'السائقين' : 'Drivers' },
        { id: 'vehicles', icon: Car, label: t('vehicles') },
        { id: 'routes', icon: Map, label: t('admin_routes') },
        { id: 'rates', icon: Banknote, label: t('admin_rates') }
      ]
    },
    {
      group: i18n.language === 'ar' ? 'إدارة الصفحات والمحتوى' : 'Pages & CMS',
      items: [
        { id: 'testimonials', icon: Star, label: i18n.language === 'ar' ? 'تقييمات وآراء العملاء' : 'Guest Reviews & Ratings' },
        { id: 'page_builder', icon: LayoutDashboard, label: i18n.language === 'ar' ? 'بناء الصفحة الرئيسية' : 'Page Builder (Home)' },
        { id: 'settings', icon: Settings, label: t('admin_settings') }
      ]
    }
  ];

  if (currentUser?.role === 'master_admin') {
    navGroups.push({
      group: i18n.language === 'ar' ? 'الأمان والصلاحيات العليا' : 'Master Security & Audit',
      items: [
        { id: 'users', icon: ShieldCheck, label: i18n.language === 'ar' ? 'إدارة المسؤولين' : 'Admin Users' },
        { id: 'activity', icon: Activity, label: i18n.language === 'ar' ? 'سجل النشاط' : 'Activity Logs' }
      ]
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} z-40 w-72 bg-[var(--color-dark-charcoal)] text-white flex flex-col h-full shrink-0 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : (i18n.language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')
      } ${i18n.language === 'ar' ? 'border-l' : 'border-r'} border-[var(--color-saudi-emerald)]/40`}>
        
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[var(--color-luxury-gold)] shadow-inner">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[var(--color-luxury-gold)] tracking-wide leading-tight">
                {t('admin_title')}
              </h1>
              <div className="text-[11px] text-emerald-200/70 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Admin Operations</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow p-4 overflow-y-auto space-y-6">
          {navGroups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {grp.group}
              </div>
              <ul className="space-y-1">
                {grp.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-white/15 text-[var(--color-luxury-gold)] shadow-sm font-bold border border-white/10'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-[var(--color-luxury-gold)]' : 'text-emerald-300/70'} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Live Site & Logout footer */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-black/20">
          <a 
            href="/" 
            target="_blank" 
            rel="noreferrer" 
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white/90 py-2.5 rounded-xl transition-colors text-xs font-bold border border-white/10"
          >
            <ExternalLink size={14} />
            <span>{i18n.language === 'ar' ? 'عرض الموقع المباشر' : 'View Live Website'}</span>
          </a>

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 bg-red-500/20 text-red-200 hover:bg-red-600 hover:text-white py-2.5 rounded-xl transition-colors text-xs font-bold"
          >
            <LogOut size={14} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-full overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10 shadow-xs shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 capitalize">
                {t(
                  activeTab === 'dashboard' ? 'admin_dashboard' : 
                  activeTab === 'bookings' ? 'admin_bookings' : 
                  activeTab === 'customers' ? 'admin_customers' : 
                  activeTab === 'messages' ? 'admin_messages' : 
                  activeTab === 'vehicles' ? 'vehicles' : 
                  activeTab === 'routes' ? 'admin_routes' : 
                  activeTab === 'rates' ? 'admin_rates' : 
                  activeTab === 'settings' ? 'admin_settings' : activeTab
                )}
              </h2>
            </div>
          </div>

          {/* Right Header Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cache Remove Button */}
            <button 
              onClick={handleClearCache}
              disabled={isClearingCache}
              title={i18n.language === 'ar' ? 'مسح الذاكرة المؤقتة (الكاش) وتحديث الموقع فوراً' : 'Clear System Cache & Purge In-Memory Store'}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all flex items-center gap-1.5 border border-amber-300 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isClearingCache ? (
                <RefreshCw size={14} className="animate-spin text-amber-700" />
              ) : (
                <Zap size={14} className="text-amber-600" />
              )}
              <span className="hidden sm:inline">
                {isClearingCache 
                  ? (i18n.language === 'ar' ? 'جاري المسح...' : 'Clearing...') 
                  : (i18n.language === 'ar' ? 'مسح الكاش' : 'Clear Cache')}
              </span>
            </button>

            {/* Refresh Button */}
            <button 
              onClick={() => {
                setRefreshKey(k => k + 1);
                fetchBadgeCounts();
              }}
              title={i18n.language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">{i18n.language === 'ar' ? 'تحديث' : 'Refresh'}</span>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher variant="admin" />

            {/* Online Status Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-900 text-xs font-bold border border-gray-300/60">
              <CheckCircle2 size={13} className="text-gray-600" />
              <span>{t('system_online')}</span>
            </div>
          </div>
        </header>

        {/* Toast Alert for Cache Clear */}
        {cacheToast && (
          <div className="fixed top-20 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="text-xs font-bold tracking-wide">{cacheToast}</span>
          </div>
        )}

        {/* Tab Body Scroll View */}
        <div key={refreshKey} className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/80">
          <div className="max-w-7xl mx-auto pb-16">
            {activeTab === 'dashboard' && <DashboardHome setActiveTab={setActiveTab} />}
            {activeTab === 'bookings' && <BookingsAdmin />}
            {activeTab === 'drivers' && <DriversAdmin />}
            {activeTab === 'vehicles' && <ManageVehicles />}
            {activeTab === 'routes' && <RoutesAdmin />}
            {activeTab === 'rates' && <RatesAdmin />}
            {activeTab === 'customers' && <CustomersAdmin />}
            {activeTab === 'messages' && <MessagesAdmin />}
            {activeTab === 'settings' && <SettingsAdmin />}
            {activeTab === 'testimonials' && <ReviewsAdmin />}
            {activeTab === 'page_builder' && <PageBuilderAdmin />}
            {activeTab === 'users' && <UsersAdmin />}
            {activeTab === 'activity' && <ActivityAdmin />}
          </div>
        </div>
      </main>
    </div>
  );
}
