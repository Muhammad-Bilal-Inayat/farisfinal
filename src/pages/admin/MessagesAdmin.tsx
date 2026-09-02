import React, { useEffect, useState } from 'react';
import { 
  Mail, Check, MessageCircle, Phone, Clock, Search, 
  CheckCircle, X, Trash2, Reply, Send, Inbox, ShieldCheck 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MessagesAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Unread' | 'Read'>('all');
  const [toast, setToast] = useState<string | null>(null);

  const fetchMessages = () => {
    fetch('/api/admin/messages', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(res => res.json())
      .then(data => { setMessages(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => { fetchMessages(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(isAr ? `تم تحديث حالة الرسالة: ${status}` : `Message marked as ${status}`);
        fetchMessages();
      }
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف هذه الرسالة نهائياً؟' : 'Delete this message permanently?')) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (res.ok) {
        showToast(isAr ? 'تم حذف الرسالة بنجاح' : 'Message deleted successfully');
        fetchMessages();
      }
    } catch (e) {
      alert("Failed to delete message");
    }
  };

  const handleWhatsApp = (m: any) => {
    const rawPhone = m.whatsapp || m.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      alert(isAr ? "رقم الهاتف غير مسجل" : "Phone number missing");
      return;
    }

    const text = isAr
      ? `السلام عليكم ورحمة الله وبركاته، الأخ/الأخت ${m.name || ''}، بخصوص استفساركم الوارد لشركة الصفوة لنقل المعتمرين:\n"${(m.message || '').slice(0, 100)}..."\n\nنحن بخدمتكم ويسعدنا تقديم أفضل عروض التوصيل الفاخر.`
      : `Assalamu Alaikum / Greetings Mr/Ms ${m.name || ''}, regarding your Umrah transport inquiry:\n"${(m.message || '').slice(0, 100)}..."\n\nAl-Safwa VIP Transport team is here to assist you with special offers.`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    updateStatus(m.id, 'Read');
  };

  const filtered = messages.filter(m => {
    const matchesSearch = 
      (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (m.email || '').toLowerCase().includes(search.toLowerCase()) || 
      (m.phone || '').includes(search) || 
      (m.message || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const unreadCount = messages.filter(m => m.status === 'Unread').length;

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
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isAr ? 'صندوق رسائل واستفسارات المعتمرين' : 'Customer Inquiries & Messages'}
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-pulse">
                {unreadCount} {isAr ? 'جديدة' : 'New'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? 'متابعة طلبات التواصل والاستفسارات الخاصة بالأسطول والرحلات' : 'Manage custom quotes, inquiries, and customer feedback'}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filter === 'all' ? 'bg-[var(--color-saudi-emerald)] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isAr ? 'جميع الرسائل' : 'All Messages'} ({messages.length})
          </button>
          <button
            onClick={() => setFilter('Unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filter === 'Unread' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isAr ? 'غير مقروءة' : 'Unread'} ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('Read')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filter === 'Read' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isAr ? 'تمت القراءة' : 'Read'} ({messages.filter(m => m.status === 'Read').length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder={isAr ? 'بحث بالاسم، النص، أو الجوال...' : 'Search message text, sender, phone...'} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            {isAr ? 'جاري تحميل الرسائل...' : 'Loading messages...'}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            <Inbox size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold">{isAr ? 'لا توجد رسائل مطابقة' : 'No messages found in inbox'}</p>
          </div>
        ) : (
          filtered.map(m => {
            const isUnread = m.status === 'Unread';
            return (
              <div 
                key={m.id} 
                className={`p-6 rounded-2xl shadow-xs border transition-all ${
                  isUnread 
                    ? 'bg-gray-50/30 border-emerald-300 ring-1 ring-emerald-300/50' 
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {isUnread && <span className="w-2.5 h-2.5 rounded-full bg-gray-500 animate-ping" />}
                      <h3 className="text-base font-extrabold text-slate-900">{m.name}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${isUnread ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>
                        {m.status || 'Read'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1 font-semibold">
                      <span className="flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {m.email || 'No email'}</span>
                      <span className="flex items-center gap-1" dir="ltr"><Phone size={12} className="text-gray-600" /> {m.phone || 'No phone'}</span>
                      <span className="flex items-center gap-1"><Clock size={12} className="text-slate-400" /> {new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleWhatsApp(m)} 
                      className="px-3 py-1.5 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-emerald)] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle size={14} />
                      <span>{isAr ? 'رد عبر واتساب' : 'Reply via WhatsApp'}</span>
                    </button>

                    {isUnread ? (
                      <button 
                        onClick={() => updateStatus(m.id, 'Read')} 
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={14} />
                        <span>{isAr ? 'تعليم كمقروء' : 'Mark Read'}</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateStatus(m.id, 'Unread')} 
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isAr ? 'إعادة كغير مقروء' : 'Mark Unread'}</span>
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteMessage(m.id)} 
                      title={isAr ? 'حذف الرسالة' : 'Delete Message'}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 text-slate-800 text-xs font-medium whitespace-pre-wrap leading-relaxed">
                  {m.message}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
