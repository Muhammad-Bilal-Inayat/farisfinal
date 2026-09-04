import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  CheckCircle, 
  XCircle, 
  X, 
  Sparkles, 
  Quote, 
  MapPin, 
  RefreshCw,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Check,
  ShieldAlert
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface TestimonialRecord {
  id: number;
  customerName: string;
  location?: string | null;
  text: string;
  rating: number;
  status: 'active' | 'pending' | 'rejected' | 'inactive';
  displayOrder?: number;
  bookingId?: string | null;
  createdAt?: string;
}

export default function ReviewsAdmin() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [reviews, setReviews] = useState<TestimonialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<TestimonialRecord | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    location: '',
    text: '',
    rating: 5,
    status: 'active' as 'active' | 'pending' | 'rejected' | 'inactive',
    displayOrder: 0,
    bookingId: ''
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      let loaded: TestimonialRecord[] | null = null;
      if (token) {
        const res = await fetch('/api/admin/testimonials', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            loaded = data;
          }
        }
      }

      // Fallback to public endpoint so reviews are never empty if DB has records
      if (!loaded || loaded.length === 0) {
        const pubRes = await fetch('/api/testimonials', { cache: 'no-store' });
        if (pubRes.ok) {
          const pubData = await pubRes.json();
          if (Array.isArray(pubData) && pubData.length > 0) {
            loaded = pubData;
          }
        }
      }

      setReviews(Array.isArray(loaded) ? loaded : []);
    } catch (err) {
      console.error('Failed to fetch testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormData({
      customerName: '',
      location: '',
      text: '',
      rating: 5,
      status: 'active',
      displayOrder: (reviews.length + 1),
      bookingId: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rev: TestimonialRecord) => {
    setEditingReview(rev);
    setFormData({
      customerName: rev.customerName || '',
      location: rev.location || '',
      text: rev.text || '',
      rating: rev.rating || 5,
      status: (rev.status as any) || 'active',
      displayOrder: rev.displayOrder || 0,
      bookingId: rev.bookingId || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.text.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال اسم العميل ونص التقييم' : 'Customer Name and Review Text are required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    const token = localStorage.getItem('adminToken');
    try {
      const url = editingReview 
        ? `/api/admin/testimonials/${editingReview.id}`
        : '/api/admin/testimonials';
      const method = editingReview ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        triggerToast(isAr ? 'تم حفظ التقييم بنجاح وتحديث الموقع مباشرة' : 'Review saved and synced to website immediately!');
        fetchReviews();
        window.dispatchEvent(new CustomEvent('faris_reviews_updated'));
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || (isAr ? 'فشل الحفظ' : 'Failed to save review'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'حدث خطأ في الاتصال' : 'Network error'));
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Approve & Publish
  const handleApprove = async (rev: TestimonialRecord) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/admin/testimonials/${rev.id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === rev.id ? { ...r, status: 'active' } : r));
        triggerToast(isAr ? `تمت الموافقة على تقييم "${rev.customerName}" ونشره على الموقع` : `Approved & published review from "${rev.customerName}" to website!`);
        window.dispatchEvent(new CustomEvent('faris_reviews_updated'));
      } else {
        // Fallback update
        await fetch(`/api/admin/testimonials/${rev.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status: 'active' })
        });
        setReviews(prev => prev.map(r => r.id === rev.id ? { ...r, status: 'active' } : r));
        triggerToast(isAr ? 'تم اعتماد التقييم بنجاح' : 'Review approved successfully');
        window.dispatchEvent(new CustomEvent('faris_reviews_updated'));
      }
    } catch (err) {
      console.error('Approve error', err);
    }
  };

  // 1-Click Reject & Hide
  const handleReject = async (rev: TestimonialRecord) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/admin/testimonials/${rev.id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === rev.id ? { ...r, status: 'rejected' } : r));
        triggerToast(isAr ? `تم رفض التقييم وإخفاؤه من الموقع` : `Review rejected and hidden from public website.`);
        window.dispatchEvent(new CustomEvent('faris_reviews_updated'));
      } else {
        // Fallback update
        await fetch(`/api/admin/testimonials/${rev.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status: 'rejected' })
        });
        setReviews(prev => prev.map(r => r.id === rev.id ? { ...r, status: 'rejected' } : r));
        triggerToast(isAr ? 'تم إخفاء التقييم' : 'Review hidden');
        window.dispatchEvent(new CustomEvent('faris_reviews_updated'));
      }
    } catch (err) {
      console.error('Reject error', err);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmText = isAr ? 'هل أنت متأكد من رغبتك في حذف هذا التقييم نهائياً من قاعدة البيانات؟' : 'Delete this review permanently from the database?';
    if (!window.confirm(confirmText)) return;

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        triggerToast(isAr ? 'تم حذف التقييم ومزامنته مع الموقع' : 'Review deleted and synchronized with website.');
        window.dispatchEvent(new CustomEvent('faris_reviews_updated'));
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const activeCount = reviews.filter(r => r.status === 'active').length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected' || r.status === 'inactive').length;

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = 
      (rev.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.bookingId || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'pending') return rev.status === 'pending';
    if (statusFilter === 'active') return rev.status === 'active';
    if (statusFilter === 'rejected') return rev.status === 'rejected' || rev.status === 'inactive';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-saudi-green)] uppercase tracking-wider mb-1">
            <Quote size={14} className="text-[var(--color-luxury-gold)]" />
            <span>{isAr ? 'إدارة واعتماد آراء الضيوف والمعتمرين' : 'Reviews & Approval Moderation'}</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--color-dark-charcoal)]">
            {isAr ? 'تقييمات وآراء العملاء' : 'Guest Reviews & Ratings'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isAr 
              ? 'مراجعة واعتماد التقييمات الجديدة، ونشرها فوراً على سلايدر الموقع أو إخفاؤها وحذفها.' 
              : 'Review pending customer feedback, approve and publish to the live site slider, or reject and manage testimonials.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReviews}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="bg-[var(--color-saudi-green)] hover:bg-[#005237] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>{isAr ? 'إضافة تقييم جديد' : 'Add New Review'}</span>
          </button>
        </div>
      </div>

      {/* Success notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle size={16} className="text-[var(--color-saudi-green)] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Pending Reviews Alert Banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Clock size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black">
                {isAr 
                  ? `يوجد ${pendingCount} تقييم جديد بانتظار المراجعة والاعتماد!` 
                  : `${pendingCount} New Review${pendingCount > 1 ? 's' : ''} Pending Admin Approval!`}
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {isAr 
                  ? 'التقييمات المعلقة لا تظهر على الموقع العام حتى تقوم بالموافقة عليها.' 
                  : 'Pending reviews remain hidden from the website until approved by an administrator.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            {isAr ? 'عرض المعلقة الآن' : 'Review Pending'}
          </button>
        </div>
      )}

      {/* Stats Bar & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'all' ? 'border-[var(--color-saudi-green)] ring-2 ring-[var(--color-saudi-green)]/15' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-bold uppercase">{isAr ? 'إجمالي التقييمات' : 'Total Reviews'}</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              <Quote size={16} />
            </div>
          </div>
          <span className="text-2xl font-black text-gray-900 mt-2 block">{reviews.length}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/15' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-700 font-bold uppercase">{isAr ? 'قيد المراجعة' : 'Pending Approval'}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full animate-pulse">
                {isAr ? 'بحاجة لموافقة' : 'Needs Action'}
              </span>
            )}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('active')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'active' ? 'border-[var(--color-saudi-green)] ring-2 ring-[var(--color-saudi-green)]/15' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-700 font-bold uppercase">{isAr ? 'معتمد ومنشور' : 'Published on Site'}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <CheckCircle size={16} />
            </div>
          </div>
          <span className="text-2xl font-black text-[var(--color-saudi-green)] mt-2 block">{activeCount}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('rejected')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'rejected' ? 'border-red-500 ring-2 ring-red-500/15' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">{isAr ? 'مرفوض ومخفي' : 'Hidden / Rejected'}</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
              <XCircle size={16} />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-700 mt-2 block">{rejectedCount}</span>
        </div>
      </div>

      {/* Search & Status Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، المسار، أو نص التقييم...' : 'Search guest, city, route, or text...'}
            className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:border-[var(--color-saudi-green)]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-[var(--color-saudi-green)] text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'الكل' : 'All'} ({reviews.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
              statusFilter === 'pending' 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Clock size={12} />
            <span>{isAr ? 'قيد المراجعة' : 'Pending'}</span>
            <span className="bg-amber-200/60 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px] ml-1">
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'active' 
                ? 'bg-[var(--color-saudi-green)] text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'المنشورة' : 'Published'} ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'rejected' 
                ? 'bg-slate-700 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'المخفية / المرفوضة' : 'Hidden'} ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-gray-500">
          <div className="w-8 h-8 border-3 border-[var(--color-saudi-green)]/30 border-t-[var(--color-saudi-green)] rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-bold">{isAr ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-gray-500">
          <Quote size={36} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm font-bold text-gray-700">{isAr ? 'لم يتم العثور على أي تقييمات مطابقة' : 'No reviews match your criteria'}</p>
          <p className="text-xs text-gray-400 mt-1">{isAr ? 'اضغط على زر إضافة تقييم جديد لإضافة أول تقييم' : 'Click "Add New Review" to add one'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((rev) => {
            const isPending = rev.status === 'pending';
            const isActive = rev.status === 'active';
            const isRejected = rev.status === 'rejected' || rev.status === 'inactive';

            return (
              <div 
                key={rev.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                  isPending 
                    ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300/60' 
                    : isActive 
                    ? 'border-slate-200/90 hover:shadow-md' 
                    : 'border-dashed border-slate-300 bg-slate-50/60 opacity-80'
                }`}
              >
                <div>
                  {/* Card Top: Stars & Status Badge */}
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {isPending ? (
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Clock size={11} className="animate-pulse" />
                        <span>{isAr ? 'قيد المراجعة' : 'Pending Approval'}</span>
                      </span>
                    ) : isActive ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[var(--color-saudi-green)] border border-emerald-200 flex items-center gap-1">
                        <CheckCircle size={11} />
                        <span>{isAr ? 'منشور على الموقع' : 'Published'}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                        <EyeOff size={11} />
                        <span>{isAr ? 'مخفي / مرفوض' : 'Hidden'}</span>
                      </span>
                    )}
                  </div>

                  {/* Booking ID tag if present */}
                  {rev.bookingId && (
                    <div className="mb-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        {isAr ? 'رقم الحجز:' : 'Order:'} {rev.bookingId}
                      </span>
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium mb-4 line-clamp-4">
                    "{rev.text}"
                  </p>
                </div>

                {/* Moderation Actions Bar */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {/* If Pending: Show Approve / Reject buttons */}
                  {isPending && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApprove(rev)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Check size={14} />
                        <span>{isAr ? 'موافقة ونشر' : 'Approve & Publish'}</span>
                      </button>
                      <button
                        onClick={() => handleReject(rev)}
                        className="w-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
                      >
                        <X size={14} />
                        <span>{isAr ? 'رفض وإخفاء' : 'Reject & Hide'}</span>
                      </button>
                    </div>
                  )}

                  {/* If Active: Allow Unpublish / Hide */}
                  {isActive && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleReject(rev)}
                        className="text-[11px] text-slate-500 hover:text-amber-700 font-bold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <EyeOff size={13} />
                        <span>{isAr ? 'إخفاء من الموقع' : 'Unpublish from Website'}</span>
                      </button>
                    </div>
                  )}

                  {/* If Rejected / Hidden: Allow Approve */}
                  {isRejected && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleApprove(rev)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <Check size={13} />
                        <span>{isAr ? 'إعادة النشر على الموقع' : 'Re-Approve & Publish'}</span>
                      </button>
                    </div>
                  )}

                  {/* Card Footer: Guest details and Edit/Delete icons */}
                  <div className="flex items-end justify-between gap-3 pt-1">
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {rev.customerName}
                      </h4>
                      {rev.location && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate mt-0.5">
                          <MapPin size={11} className="shrink-0 text-amber-600" />
                          <span className="truncate">{rev.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(rev)}
                        className="p-1.5 text-slate-600 hover:text-[var(--color-saudi-green)] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title={isAr ? 'تعديل' : 'Edit'}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Quote size={18} className="text-[var(--color-luxury-gold)]" />
                <h3 className="font-bold text-base">
                  {editingReview 
                    ? (isAr ? 'تعديل تقييم العميل' : 'Edit Customer Review') 
                    : (isAr ? 'إضافة تقييم معتمر جديد' : 'Add New Guest Review')}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'اسم العميل / الضيف' : 'Customer / Pilgrim Name'} *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Haji Muhammad Farooq"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:border-[var(--color-saudi-green)]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {isAr ? 'المدينة أو المسار' : 'City or Route'}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Jeddah ➔ Makkah"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:border-[var(--color-saudi-green)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {isAr ? 'حالة الاعتماد والنشر' : 'Moderation Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:border-[var(--color-saudi-green)] bg-white"
                  >
                    <option value="active">{isAr ? 'معتمد ومنشور على الموقع' : 'Approved (Published on Site)'}</option>
                    <option value="pending">{isAr ? 'قيد المراجعة (معلق)' : 'Pending Review'}</option>
                    <option value="rejected">{isAr ? 'مرفوض ومخفي' : 'Rejected / Hidden'}</option>
                  </select>
                </div>
              </div>

              {/* Interactive Star Rating */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'التقييم (عدد النجوم)' : 'Rating (Stars)'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star 
                          size={22} 
                          className={star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {formData.rating} / 5
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'نص التقييم والتجربة' : 'Review Text & Experience'} *
                </label>
                <textarea
                  rows={4}
                  value={formData.text}
                  onChange={e => setFormData({ ...formData, text: e.target.value })}
                  placeholder={isAr ? 'اكتب رأي العميل وتجربته في خدمة التوصيل...' : 'Write the pilgrim testimonial feedback...'}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:border-[var(--color-saudi-green)]"
                  required
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[var(--color-saudi-green)] hover:bg-[#005237] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{editingReview ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة ونشر' : 'Add Review')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
