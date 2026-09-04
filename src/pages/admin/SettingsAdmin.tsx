import React, { useEffect, useState } from 'react';
import { 
  Settings, Phone, MessageSquare, Globe, Shield, Save, 
  CheckCircle, X, Sparkles, RefreshCw, Send, Eye, Building2, 
  Clock, Banknote, HelpCircle, Zap, Trash2, Server, HardDrive, CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SettingsAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [settings, setSettings] = useState<any>({
    companyName: 'Al-Safwa VIP Umrah Transports',
    websiteDomain: 'alsafwa-transport.com',
    phoneNumber: '+966500000000',
    confirmationMessage: 'مرحباً بك {name}، تم تأكيد حجزك لرحلة {route} على متن {vehicle}. السعر الإجمالي: {price} ريال. سائقك سيكون بالانتظار.',
    generalMessage: 'السلام عليكم ورحمة الله، أود الاستفسار عن خدمات التوصيل الفاخر بين مكة والمدينة والمطارات.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'company' | 'templates' | 'cache'>('whatsapp');
  
  // Cache stats
  const [cacheStatus, setCacheStatus] = useState<any>({ cacheEntries: 0, totalHits: 0, lastPurgedAt: null });
  const [clearingCache, setClearingCache] = useState(false);

  const fetchCacheStatus = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/cache/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCacheStatus(await res.json());
      }
    } catch (e) {
      console.warn("Failed to fetch cache status", e);
    }
  };

  const handleClearCacheFromSettings = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setClearingCache(true);
    try {
      const res = await fetch('/api/admin/cache/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        try { sessionStorage.clear(); } catch (e) {}
        setToast(isAr ? 'تم تفريغ وحذف الذاكرة المؤقتة بالكامل بنجاح!' : 'All server & client cache purged successfully!');
        fetchCacheStatus();
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {
      setToast(isAr ? 'تعذر مسح الكاش، حاول ثانية' : 'Failed to clear cache, please retry');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setClearingCache(false);
    }
  };

  const fetchSettings = () => {
    Promise.all([
      fetch('/api/whatsapp').then(res => res.json()).catch(() => ({})),
      fetch('/api/settings').then(res => res.json()).catch(() => ({}))
    ]).then(([whatsapp, globalSettings]) => {
      setSettings((prev: any) => ({
        ...prev,
        ...(whatsapp || {}),
        ...(globalSettings || {})
      }));
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  };

  useEffect(() => { fetchSettings(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/admin/whatsapp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({
          phoneNumber: settings.phoneNumber,
          adminNotificationPhone: settings.adminNotificationPhone || settings.phoneNumber,
          confirmationMessage: settings.confirmationMessage,
          generalMessage: settings.generalMessage
        })
      });
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({
          companyName: settings.companyName,
          websiteDomain: settings.websiteDomain,
          seoTitle: settings.seoTitle,
          seoDescription: settings.seoDescription,
          seoKeywords: settings.seoKeywords,
          popupEnabled: settings.popupEnabled,
          popupTitle: settings.popupTitle,
          popupDescription: settings.popupDescription,
          popupImageBase64: settings.popupImageBase64
        })
      });
      showToast(isAr ? 'تم حفظ كافة الإعدادات بنجاح!' : 'All settings saved successfully!');
    } catch (e) {
      alert(isAr ? "فشل حفظ الإعدادات" : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const testWhatsAppNumber = () => {
    const raw = (settings.phoneNumber || '').replace(/[^0-9]/g, '');
    if (!raw) {
      alert(isAr ? "الرجاء إدخال رقم واتساب صالح أولاً" : "Please enter a valid WhatsApp number first");
      return;
    }
    window.open(`https://wa.me/${raw}?text=${encodeURIComponent(settings.generalMessage || 'Hello Al-Safwa VIP')}`, '_blank');
  };


  const handlePopupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, popupImageBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
        {isAr ? 'جاري تحميل الإعدادات العامة...' : 'Loading system settings...'}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
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
            {isAr ? 'إعدادات المنظومة والربط المباشر' : 'System Configuration & Dispatch Settings'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? 'إدارة رقم الواتساب الموحد، قوالب الرسائل الفورية، ومعلومات الهوية' : 'Control global WhatsApp dispatch, booking templates, and company branding'}
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={15} /> : <Save size={15} />}
          <span>{isAr ? (saving ? 'جاري الحفظ...' : 'حفظ التغييرات') : (saving ? 'Saving...' : 'Save Settings')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'whatsapp' ? 'bg-[var(--color-saudi-emerald)] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Phone size={14} />
          <span>{isAr ? 'واتساب والرد الآلي' : 'WhatsApp & Dispatch'}</span>
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'company' ? 'bg-[var(--color-saudi-emerald)] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Building2 size={14} />
          <span>{isAr ? 'بيانات المؤسسة والهوية' : 'Company & Identity'}</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'templates' ? 'bg-[var(--color-saudi-emerald)] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MessageSquare size={14} />
          <span>{isAr ? 'قوالب تأكيد الحجز' : 'Booking Templates'}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('cache');
            fetchCacheStatus();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'cache' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
          }`}
        >
          <Zap size={14} />
          <span>{isAr ? 'الذاكرة المؤقتة والأداء' : 'Cache & Speed'}</span>
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: WHATSAPP */}
        {activeTab === 'whatsapp' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'رقم الواتساب الرئيسي الموحد (مع الرمز الدولي)' : 'Global Dispatch WhatsApp Number (with Country Code)'}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={settings.phoneNumber || ''} 
                    onChange={e => setSettings({ ...settings, phoneNumber: e.target.value })} 
                    className="flex-1 border border-slate-200 p-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    placeholder="+966500000000" 
                    dir="ltr"
                    required 
                  />
                  <button
                    type="button"
                    onClick={testWhatsAppNumber}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>{isAr ? 'اختبار الرقم' : 'Test Chat'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isAr ? 'هذا الرقم يُستخدم في جميع أزرار الحجز والتواصل الفوري في الموقع كامل' : 'This number triggers whenever a pilgrim clicks WhatsApp, Book Now, or Inquire.'}
                </p>
              </div>



              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'رسالة الاستفسار العامة الافتراضية' : 'Default General Inquiry Greeting'}
                </label>
                <textarea 
                  value={settings.generalMessage || ''} 
                  onChange={e => setSettings({ ...settings, generalMessage: e.target.value })} 
                  className="w-full border border-slate-200 p-3 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none h-28 leading-relaxed" 
                  required 
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {isAr ? 'النص الذي يظهر للمعتمر عند الضغط على زر الواتساب العائم في أسفل الموقع' : 'Pre-filled greeting when clicking the floating WhatsApp button.'}
                </p>
              </div>
            </div>

            {/* Live WhatsApp Simulator */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[var(--color-dark-charcoal)] to-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--color-saudi-emerald)]/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center font-black text-xs text-white">
                      VIP
                    </div>
                    <div>
                      <div className="text-xs font-extrabold">{settings.companyName || 'Al-Safwa Transport'}</div>
                      <div className="text-[10px] text-emerald-400">Online • 24/7 VIP Support</div>
                    </div>
                  </div>
                  <Eye size={16} className="text-emerald-400" />
                </div>

                <div className="bg-[#0b141a] rounded-xl p-4 shadow-inner space-y-3 font-sans">
                  <div className="bg-[#005c4b] text-white p-3 rounded-xl rounded-tr-none text-xs leading-relaxed max-w-[90%] ml-auto">
                    <p className="text-[11px] whitespace-pre-wrap">{settings.generalMessage || 'Hello'}</p>
                    <span className="block text-[9px] text-emerald-200/60 text-right mt-1">10:45 AM ✓✓</span>
                  </div>

                  <div className="bg-[#202c33] text-white p-3 rounded-xl rounded-tl-none text-xs leading-relaxed max-w-[90%]">
                    <p className="text-[11px]">
                      {isAr ? 'أهلاً وسهلاً بك في ضيافة الرحمن! يسعدنا خدمتكم في رحاب مكة والمدينة.' : 'Welcome to Al-Safwa VIP! We are delighted to serve your Umrah journey.'}
                    </p>
                    <span className="block text-[9px] text-slate-400 text-right mt-1">10:46 AM</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-saudi-emerald)]/40 text-center text-[11px] text-emerald-300 font-semibold">
                📱 {isAr ? 'معاينة حية لتجربة المعتمر عبر واتساب' : 'Live WhatsApp Experience Preview'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY & BRAND */}
        {activeTab === 'company' && (
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'اسم الشركة الرسمي' : 'Official Brand Name'}
                </label>
                <input 
                  type="text" 
                  value={settings.companyName || ''} 
                  onChange={e => setSettings({ ...settings, companyName: e.target.value })} 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'نطاق الموقع الإلكتروني' : 'Website Domain'}
                </label>
                <input 
                  type="text" 
                  value={settings.websiteDomain || ''} 
                  onChange={e => setSettings({ ...settings, websiteDomain: e.target.value })} 
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                  required 
                />
              </div>


              <div className="md:col-span-2 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 mb-4">{isAr ? 'إعدادات محركات البحث (SEO)' : 'SEO Settings'}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'عنوان الموقع (Meta Title)' : 'Meta Title'}
                    </label>
                    <input 
                      type="text" 
                      value={settings.seoTitle || ''} 
                      onChange={e => setSettings({ ...settings, seoTitle: e.target.value })} 
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                      placeholder={isAr ? 'مثال: فارس للنقل المتميز' : 'e.g. Faris VIP Transport'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'وصف الموقع (Meta Description)' : 'Meta Description'}
                    </label>
                    <textarea 
                      value={settings.seoDescription || ''} 
                      onChange={e => setSettings({ ...settings, seoDescription: e.target.value })} 
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none h-20" 
                      placeholder={isAr ? 'وصف قصير للشركة يظهر في جوجل' : 'Short description appearing in Google search'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'الكلمات المفتاحية (Keywords)' : 'Keywords (Comma separated)'}
                    </label>
                    <input 
                      type="text" 
                      value={settings.seoKeywords || ''} 
                      onChange={e => setSettings({ ...settings, seoKeywords: e.target.value })} 
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                      placeholder={isAr ? 'عمرة، مكة، نقل، سيارات' : 'umrah, makkah, transport, cars'}
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900">{isAr ? 'نافذة العروض (Promo Popup)' : 'Promo Popup Settings'}</h3>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={settings.popupEnabled === 'true'}
                        onChange={(e) => setSettings({ ...settings, popupEnabled: e.target.checked ? 'true' : 'false' })}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${settings.popupEnabled === 'true' ? 'bg-[var(--color-saudi-green)]' : 'bg-slate-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.popupEnabled === 'true' ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-xs font-bold text-slate-700">
                      {settings.popupEnabled === 'true' ? (isAr ? 'مفعل' : 'Enabled') : (isAr ? 'معطل' : 'Disabled')}
                    </div>
                  </label>
                </div>

                {settings.popupEnabled === 'true' && (
                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isAr ? 'عنوان النافذة' : 'Popup Title'}
                      </label>
                      <input 
                        type="text" 
                        value={settings.popupTitle || ''} 
                        onChange={e => setSettings({ ...settings, popupTitle: e.target.value })} 
                        className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                        placeholder={isAr ? 'مثال: عرض خاص!' : 'e.g. Special Offer!'}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isAr ? 'نص النافذة' : 'Popup Description'}
                      </label>
                      <textarea 
                        value={settings.popupDescription || ''} 
                        onChange={e => setSettings({ ...settings, popupDescription: e.target.value })} 
                        className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none h-20" 
                        placeholder={isAr ? 'اكتب تفاصيل العرض هنا...' : 'Write promo details here...'}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isAr ? 'صورة النافذة' : 'Popup Image'}
                      </label>
                      <div className="flex items-center gap-4">
                        {settings.popupImageBase64 ? (
                          <img loading="lazy" decoding="async" src={settings.popupImageBase64} alt="Popup preview" className="h-16 w-auto object-contain bg-white p-1 rounded-lg border border-slate-200" />
                        ) : (
                          <div className="h-16 w-24 bg-white flex items-center justify-center rounded-lg border border-slate-200 text-xs text-slate-400">No Image</div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handlePopupImageUpload}
                          className="flex-1 border border-slate-200 p-2.5 bg-white rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-200 flex items-start gap-3">
              <Shield className="text-gray-900 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-[var(--color-dark-charcoal)] font-medium">
                <p className="font-extrabold">{isAr ? 'ترخيص النقل السياحي المعتمد' : 'Licensed VIP Umrah Transport'}</p>
                <p className="text-[var(--color-dark-charcoal)]/80 mt-0.5">
                  {isAr 
                    ? 'جميع المركبات مؤمنة بالكامل ومتوافقة مع متطلبات الهيئة العامة للنقل ووزارة الحج والعمرة بالمملكة العربية السعودية.' 
                    : 'All fleet vehicles are fully insured and adhere to Kingdom of Saudi Arabia Ministry of Hajj & Umrah transport standards.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  {isAr ? 'قالب رسالة تأكيد الحجز (تُرسل للضيف عند القبول)' : 'Booking Confirmation Dispatch Template'}
                </label>
                <span className="text-[10px] font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded">
                  {isAr ? 'متغيرات ديناميكية متاحة' : 'Dynamic tags supported'}
                </span>
              </div>
              <textarea 
                value={settings.confirmationMessage || ''} 
                onChange={e => setSettings({ ...settings, confirmationMessage: e.target.value })} 
                className="w-full border border-slate-200 p-3 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none h-32 leading-relaxed font-mono" 
                required 
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['{name}', '{route}', '{vehicle}', '{price}', '{date}'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-mono font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CACHE & PERFORMANCE */}
        {activeTab === 'cache' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Zap className="text-amber-500" size={18} />
                    <span>{isAr ? 'إدارة الذاكرة المؤقتة (Cache Management)' : 'High-Speed Memory & Site Cache'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isAr 
                      ? 'يحتفظ الخادم بنسخ فائقة السرعة للأسعار والأسطول والمسارات لتقديم استجابة فورية للمعتمرين. استخدم هذا الزر لمسح الكاش وتحديث البيانات للجميع فوراً.' 
                      : 'The server maintains high-speed in-memory caches of rates, fleet, and routes for sub-millisecond client loads. Purge anytime to push changes live instantly.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearCacheFromSettings}
                  disabled={clearingCache}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {clearingCache ? <RefreshCw className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  <span>{isAr ? (clearingCache ? 'جاري مسح الكاش...' : 'مسح الذاكرة المؤقتة الآن') : (clearingCache ? 'Purging Cache...' : 'Purge All Cache Now')}</span>
                </button>
              </div>

              {/* Cache Health Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
                    <Server size={14} className="text-emerald-600" />
                    <span>{isAr ? 'العناصر المخزنة في الذاكرة' : 'Cached API Keys'}</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {cacheStatus.cacheEntries ?? 0}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAr ? 'المسارات والأسعار والسيارات' : 'Active memory tags'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
                    <Zap size={14} className="text-amber-600" />
                    <span>{isAr ? 'إجمالي مرات التسريع (Cache Hits)' : 'Total Cache Hits'}</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {cacheStatus.totalHits ?? 0}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAr ? 'طلبات تمت خدمتها فوراً' : 'Instant responses served'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
                    <Clock size={14} className="text-blue-600" />
                    <span>{isAr ? 'آخر وقت للتفريغ والتحديث' : 'Last Purged At'}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 break-words mt-1">
                    {cacheStatus.lastPurgedAt ? new Date(cacheStatus.lastPurgedAt).toLocaleTimeString() : (isAr ? 'الآن نشط' : 'Just initialized')}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>{isAr ? 'الخادم يعمل بكفاءة 100%' : '100% Operational'}</span>
                  </p>
                </div>
              </div>

              {/* Cache Info Tips */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 space-y-1.5">
                <div className="font-extrabold flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-700" />
                  <span>{isAr ? 'ملاحظة للمدير التقني' : 'Admin Performance Note'}</span>
                </div>
                <p className="text-amber-900/90 leading-relaxed">
                  {isAr
                    ? 'يقوم النظام تلقائياً بمسح الكاش وإعادة توليد البيانات عند قيامك بتعديل الأسعار أو إضافة سيارات جديدة أو تعديل رقم الواتساب. الضغط على زر "مسح الكاش" يُفرغ الذاكرة فوراً ويُجبر متصفح جميع الزوار على جلب أحدث نسخة.'
                    : 'The system automatically invalidates cache upon editing rates, vehicles, routes, or contact settings. Using this button forces an immediate server-wide wipe so all visiting clients load fresh data on their next click.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            <span>{isAr ? (saving ? 'جاري حفظ الإعدادات...' : 'حفظ جميع التغييرات') : (saving ? 'Saving...' : 'Save All Settings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
