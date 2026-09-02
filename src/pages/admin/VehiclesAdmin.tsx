import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit, Trash2, Car, Users, Briefcase, Banknote, 
  CheckCircle, XCircle, Search, Image as ImageIcon, Sparkles, X, Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VehiclesAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  
  // Modal state
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<any>({});
  const [toast, setToast] = useState<string | null>(null);

  const fetchVehicles = () => {
    fetch('/api/admin/vehicles', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(res => res.json())
      .then(data => { setVehicles(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(console.error);
  };

  useEffect(() => { fetchVehicles(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = current.id ? 'PUT' : 'POST';
    const url = current.id ? `/api/admin/vehicles/${current.id}` : '/api/admin/vehicles';
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(current)
      });
      if (res.ok) {
        showToast(isAr ? 'تم حفظ بيانات السيارة بنجاح' : 'Vehicle details saved successfully');
        setIsEditing(false);
        fetchVehicles();
      }
    } catch (e) {
      alert("Failed to save vehicle");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isAr ? "هل أنت متأكد من أرشفة أو حذف هذه السيارة من الأسطول؟" : "Are you sure you want to deactivate/archive this vehicle?")) return;
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        showToast(isAr ? 'تم تحديث حالة الأسطول' : 'Vehicle removed from active fleet');
        fetchVehicles();
      }
    } catch (e) {
      alert("Failed to delete vehicle");
    }
  };

  const toggleStatus = async (v: any) => {
    const newStatus = v.status === 'active' ? 'archived' : 'active';
    try {
      const res = await fetch(`/api/admin/vehicles/${v.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ ...v, status: newStatus })
      });
      if (res.ok) {
        showToast(isAr ? `تم تعيين السيارة: ${newStatus === 'active' ? 'نشطة ومتاحة' : 'مؤرشفة'}` : `Vehicle status set to ${newStatus}`);
        fetchVehicles();
      }
    } catch (e) {
      alert("Failed to toggle vehicle status");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrent({ ...current, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPreset = (preset: { name: string, category: string, pax: number, bags: number, price: number, img: string, desc: string }) => {
    setCurrent({
      ...current,
      name: preset.name,
      category: preset.category,
      passengerCapacity: preset.pax,
      luggageCapacity: preset.bags,
      startingPrice: preset.price,
      imageUrl: preset.img,
      description: preset.desc,
      status: 'active'
    });
  };

  const filtered = vehicles.filter(v => {
    const matchesSearch = (v.name || '').toLowerCase().includes(search.toLowerCase()) || (v.category || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return v.status === statusFilter;
  });

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

      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isAr ? 'إدارة أسطول المركبات VIP' : 'VIP Vehicle Fleet Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? 'إضافة وتعديل سيارات نقل المعتمرين، السعات، والأسعار الأساسية' : 'Configure Umrah luxury sedans, VIP SUVs, and family coaches'}
          </p>
        </div>

        <button 
          onClick={() => { 
            setCurrent({ 
              name: '', 
              passengerCapacity: 4, 
              luggageCapacity: 3, 
              startingPrice: 200, 
              status: 'active',
              category: 'VIP SUV',
              year: new Date().getFullYear(),
              imageUrl: '',
              description: ''
            }); 
            setIsEditing(true); 
          }}
          className="px-4 py-2 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>{isAr ? '+ إضافة سيارة جديدة' : '+ Add Vehicle'}</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-[var(--color-saudi-emerald)] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isAr ? 'جميع السيارات' : 'All Fleet'} ({vehicles.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${statusFilter === 'active' ? 'bg-[var(--color-saudi-emerald)] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isAr ? 'النشطة فقط' : 'Active Only'} ({vehicles.filter(v => v.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${statusFilter === 'archived' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isAr ? 'المؤرشفة' : 'Archived'} ({vehicles.filter(v => v.status !== 'active').length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder={isAr ? 'بحث بالاسم أو الفئة...' : 'Search vehicle model, category...'} 
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

      {/* Fleet Grid / Table View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[var(--color-saudi-emerald)] border-t-transparent rounded-full animate-spin" />
              <span>{isAr ? 'جاري تحميل الأسطول...' : 'Loading fleet...'}</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            <Car size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold">{isAr ? 'لا توجد مركبات مطابقة' : 'No vehicles found in fleet'}</p>
          </div>
        ) : (
          filtered.map(v => (
            <div key={v.id} className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
              {/* Image & Category */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {v.imageUrl ? (
                  <img loading="lazy" decoding="async" src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1 bg-gradient-to-br from-slate-100 to-slate-200">
                    <Car size={40} />
                    <span className="text-xs font-bold uppercase">{v.category || 'VIP Fleet'}</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-sm ${v.status === 'active' ? 'bg-[var(--color-saudi-emerald)] text-white' : 'bg-slate-600 text-white'}`}>
                    {v.status === 'active' ? (isAr ? 'نشط ومتاح' : 'Active') : (isAr ? 'مؤرشف' : 'Archived')}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                  {v.category || 'Luxury'}
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="p-5 space-y-4 flex-1">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
                    <span>{v.name}</span>
                    {v.year && <span className="text-xs text-slate-400 font-semibold">{v.year}</span>}
                  </h3>
                  {v.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{v.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{isAr ? 'الركاب' : 'Pax'}</span>
                    <strong className="text-slate-800 font-extrabold flex items-center justify-center gap-1 mt-0.5">
                      <Users size={12} className="text-gray-700" />
                      {v.passengerCapacity}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{isAr ? 'الحقائب' : 'Bags'}</span>
                    <strong className="text-slate-800 font-extrabold flex items-center justify-center gap-1 mt-0.5">
                      <Briefcase size={12} className="text-gray-700" />
                      {v.luggageCapacity}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{isAr ? 'يبدأ من' : 'From'}</span>
                    <strong className="text-[var(--color-saudi-emerald)] font-extrabold flex items-center justify-center gap-0.5 mt-0.5">
                      {v.startingPrice || 0} SAR
                    </strong>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <button
                  onClick={() => toggleStatus(v)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    v.status === 'active' ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-gray-50 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {v.status === 'active' ? (isAr ? 'تعطيل مؤقت' : 'Deactivate') : (isAr ? 'تفعيل في الأسطول' : 'Activate')}
                </button>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => { setCurrent(v); setIsEditing(true); }} 
                    title={isAr ? 'تعديل البيانات' : 'Edit Vehicle'}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(v.id)} 
                    title={isAr ? 'حذف من الأسطول' : 'Archive Vehicle'}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {current.id ? (isAr ? 'تعديل بيانات المركبة' : 'Edit Vehicle') : (isAr ? 'إضافة مركبة جديدة للأسطول' : 'Add New Fleet Vehicle')}
              </h2>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Quick Presets for fast entry */}
            {!current.id && (
              <div className="mb-6 p-4 rounded-xl bg-gray-50/60 border border-gray-200">
                <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-dark-charcoal)] mb-2">
                  <Sparkles size={14} className="text-gray-700" />
                  <span>{isAr ? 'قوالب سريعة للأسطول الفاخر (نقرة واحدة للملء التلقائي):' : 'Instant Luxury Fleet Presets:'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'GMC Yukon XL VIP', category: 'Luxury SUV', pax: 7, bags: 6, price: 450, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800', desc: 'Top-tier luxury SUV with spacious leather seating for Umrah families and dignitaries.' },
                    { name: 'Mercedes-Benz S-Class', category: 'Executive Sedan', pax: 3, bags: 3, price: 650, img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800', desc: 'Premium executive chauffeur experience with ultimate comfort, privacy, and smooth suspension.' },
                    { name: 'Hyundai Staria VIP Coach', category: 'VIP Van', pax: 7, bags: 5, price: 350, img: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=800', desc: 'Modern futuristic minivan with captain lounge seats and panoramic sky view.' },
                    { name: 'Toyota HiAce Luxury Bus', category: 'Family Bus', pax: 11, bags: 10, price: 500, img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800', desc: 'High-roof air-conditioned passenger van designed for larger family Umrah groups.' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-900 text-xs font-bold rounded-lg hover:bg-gray-200/50 transition-colors cursor-pointer"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'اسم المركبة والموديل' : 'Vehicle Model / Name'}</label>
                  <input 
                    type="text" 
                    value={current.name || ''} 
                    onChange={e => setCurrent({ ...current, name: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    placeholder="e.g. GMC Yukon XL 2025" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'سنة الصنع' : 'Model Year'}</label>
                  <input 
                    type="number" 
                    value={current.year || ''} 
                    onChange={e => setCurrent({ ...current, year: parseInt(e.target.value) || 2025 })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'سعة الركاب' : 'Passenger Capacity'}</label>
                  <input 
                    type="number" 
                    value={current.passengerCapacity || 4} 
                    onChange={e => setCurrent({ ...current, passengerCapacity: parseInt(e.target.value) || 1 })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    min={1} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'سعة الحقائب' : 'Luggage Capacity'}</label>
                  <input 
                    type="number" 
                    value={current.luggageCapacity || 3} 
                    onChange={e => setCurrent({ ...current, luggageCapacity: parseInt(e.target.value) || 0 })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    min={0} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'السعر المبدئي (ريال)' : 'Starting Price (SAR)'}</label>
                  <input 
                    type="number" 
                    value={current.startingPrice || 0} 
                    onChange={e => setCurrent({ ...current, startingPrice: parseInt(e.target.value) || 0 })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'فئة السيارة' : 'Category'}</label>
                  <select 
                    value={current.category || 'Luxury SUV'} 
                    onChange={e => setCurrent({ ...current, category: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                  >
                    <option value="Executive Sedan">Executive Sedan</option>
                    <option value="Luxury SUV">Luxury SUV</option>
                    <option value="VIP Van">VIP Van</option>
                    <option value="Family Coach">Family Coach</option>
                    <option value="First Class Limousine">First Class Limousine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'حالة التوفر' : 'Fleet Status'}</label>
                  <select 
                    value={current.status || 'active'} 
                    onChange={e => setCurrent({ ...current, status: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                  >
                    <option value="active">{isAr ? 'نشط ومتاح للحجز' : 'Active / Available'}</option>
                    <option value="archived">{isAr ? 'مؤرشف / غير متاح' : 'Archived / Hidden'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'صورة السيارة' : 'Vehicle Image (URL or Upload)'}</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input 
                    type="text" 
                    value={current.imageUrl || ''} 
                    onChange={e => setCurrent({ ...current, imageUrl: e.target.value })} 
                    className="flex-1 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none w-full" 
                    placeholder="https://... image link" 
                  />
                  <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer shrink-0">
                    <span>{isAr ? 'رفع ملف' : 'Upload File'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {current.imageUrl && (
                  <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img loading="lazy" decoding="async" src={current.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'وصف المركبة ومميزاتها' : 'Vehicle Description & Features'}</label>
                <textarea 
                  value={current.description || ''} 
                  onChange={e => setCurrent({ ...current, description: e.target.value })} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none h-20" 
                  placeholder={isAr ? 'الميزات: واي فاي مجاني، ماء زمزم مبرد، مقاعد جلدية فاخرة...' : 'Features: Complimentary WiFi, chilled Zamzam water, luxury reclining seats...'}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  {isAr ? 'حفظ السيارة' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
