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
  SlidersHorizontal,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface TestimonialRecord {
  id: number;
  customerName: string;
  location?: string | null;
  text: string;
  rating: number;
  status: string;
  displayOrder: number;
}

export default function ReviewsAdmin() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [reviews, setReviews] = useState<TestimonialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<TestimonialRecord | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    location: '',
    text: '',
    rating: 5,
    status: 'active',
    displayOrder: 0
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const token = localStorage.getItem('adminToken');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormData({
      customerName: '',
      location: '',
      text: '',
      rating: 5,
      status: 'active',
      displayOrder: (reviews.length + 1)
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
      status: rev.status || 'active',
      displayOrder: rev.displayOrder || 0
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
        setSuccessMsg(isAr ? 'تم حفظ التقييم بنجاح' : 'Review saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchReviews();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || (isAr ? 'فشل الحفظ' : 'Failed to save review'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'حدث خطأ في الاتصال' : 'Network error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmText = isAr ? 'هل أنت متأكد من رغبتك في حذف هذا التقييم؟' : 'Are you sure you want to delete this review?';
    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg(isAr ? 'تم حذف التقييم' : 'Review deleted');
        setTimeout(() => setSuccessMsg(''), 3000);
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const handleToggleStatus = async (rev: TestimonialRecord) => {
    const newStatus = rev.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/testimonials/${rev.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === rev.id ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      console.error('Status toggle error', err);
    }
  };

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = 
      (rev.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.text || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'active') return rev.status === 'active';
    if (statusFilter === 'inactive') return rev.status === 'inactive';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-saudi-green)] uppercase tracking-wider mb-1">
            <Quote size={14} className="text-[var(--color-luxury-gold)]" />
            <span>{isAr ? 'إدارة آراء الضيوف والمعتمرين' : 'Customer Reviews & Feedback'}</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--color-dark-charcoal)]">
            {isAr ? 'تقييمات وآراء العملاء' : 'Guest Reviews & Ratings'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isAr 
              ? 'أضف وعدّل واحذف آراء المعتمرين المعروضة في سلايدر الصفحة الرئيسية بكل سهولة.' 
              : 'Add, update, or remove customer testimonials shown on the homepage live slider.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReviews}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
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
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={16} className="text-[var(--color-saudi-green)]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Bar & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase block">{isAr ? 'إجمالي التقييمات' : 'Total Reviews'}</span>
            <span className="text-2xl font-black text-gray-900">{reviews.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[var(--color-saudi-green)] flex items-center justify-center font-bold">
            <Quote size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase block">{isAr ? 'التقييمات المفعلة' : 'Active On Website'}</span>
            <span className="text-2xl font-black text-[var(--color-saudi-green)]">
              {reviews.filter(r => r.status === 'active').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase block">{isAr ? 'متوسط النجوم' : 'Average Rating'}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-amber-500">5.0</span>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400" />
                ))}
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Star size={20} className="fill-amber-400" />
          </div>
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
            placeholder={isAr ? 'بحث بالاسم، الدولة، أو نص التقييم...' : 'Search guest, city, route, or text...'}
            className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:border-[var(--color-saudi-green)]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'all' 
                ? 'bg-[var(--color-saudi-green)] text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'الكل' : 'All'} ({reviews.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'active' 
                ? 'bg-[var(--color-saudi-green)] text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'المفعلة' : 'Active'} ({reviews.filter(r => r.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'inactive' 
                ? 'bg-[var(--color-saudi-green)] text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'المعطلة' : 'Hidden'} ({reviews.filter(r => r.status === 'inactive').length})
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
          <p className="text-sm font-bold text-gray-700">{isAr ? 'لم يتم العثور على أي تقييمات' : 'No reviews match your criteria'}</p>
          <p className="text-xs text-gray-400 mt-1">{isAr ? 'اضغط على زر إضافة تقييم جديد لإضافة أول تقييم' : 'Click "Add New Review" to add one'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((rev) => (
            <div 
              key={rev.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                rev.status === 'active' 
                  ? 'border-slate-200/90 shadow-xs hover:shadow-md' 
                  : 'border-dashed border-gray-300 bg-gray-50/70 opacity-75'
              }`}
            >
              <div>
                {/* Card Top: Stars & Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <button
                    onClick={() => handleToggleStatus(rev)}
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                      rev.status === 'active'
                        ? 'bg-emerald-50 text-[var(--color-saudi-green)] border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    {rev.status === 'active' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    <span>{rev.status === 'active' ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'معطل' : 'Hidden')}</span>
                  </button>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium mb-4 line-clamp-4">
                  "{rev.text}"
                </p>
              </div>

              {/* Card Footer: Guest & Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-3">
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
          ))}
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
                className="text-white/70 hover:text-white p-1 rounded-lg"
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
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder={isAr ? 'مثال: الحاج طارق المنصور' : 'e.g. Brother Tariq Al-Mansoor'}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[var(--color-saudi-green)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'المسار / الدولة / المدينة' : 'Route / Location / Country'}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder={isAr ? 'مثال: لندن، بريطانيا (مطار جدة ➔ مكة)' : 'e.g. London, UK (Jeddah Airport ➔ Makkah)'}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[var(--color-saudi-green)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {isAr ? 'التقييم (عدد النجوم)' : 'Rating (Stars)'}
                  </label>
                  <select
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[var(--color-saudi-green)] bg-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                    <option value={2}>⭐⭐ 2 Stars</option>
                    <option value={1}>⭐ 1 Star</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {isAr ? 'حالة التفعيل' : 'Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[var(--color-saudi-green)] bg-white"
                  >
                    <option value="active">{isAr ? 'مفعل على الموقع' : 'Active (Visible)'}</option>
                    <option value="inactive">{isAr ? 'معطل (مخفي)' : 'Inactive (Hidden)'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'نص التقييم والتجربة' : 'Review Testimonial Text'} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.text}
                  onChange={e => setFormData({ ...formData, text: e.target.value })}
                  placeholder={isAr ? 'اكتب تفاصيل تجربة العميل مع الخدمة والسيارة والسائق...' : 'Share the guest feedback about chauffeur, vehicle, timing, and journey...'}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[var(--color-saudi-green)] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'ترتيب الظهور (رقم)' : 'Display Order'}
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[var(--color-saudi-green)]"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-gray-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[var(--color-saudi-green)] hover:bg-[#005237] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التقييم' : 'Save Review')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
