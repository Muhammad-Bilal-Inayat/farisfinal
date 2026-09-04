import React, { useEffect, useState, useRef } from 'react';
import { 
  Plus, Edit, Trash2, Car, Users, Briefcase, Banknote, 
  CheckCircle, XCircle, Search, Image as ImageIcon, Sparkles, X, Eye,
  Upload, ExternalLink, RefreshCw, Copy, SlidersHorizontal, Check, AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getVehicleImageByName } from '../../utils/imageUtils';
import { useBookingTracker } from '../../context/BookingTrackerContext';
import VehicleSyncMonitor from './components/VehicleSyncMonitor';

// Standard high-res Umrah fleet preset library for quick selection
const FLEET_PRESETS = [
  {
    name: 'GMC Yukon XL 2025',
    category: 'suv',
    year: 2025,
    passengerCapacity: 7,
    luggageCapacity: 8,
    startingPrice: 300,
    imageUrl: '/images/fleet/gmc-xl.jpg',
    features: 'VIP Leather Seats, 8 Large Bags, Chilled Zamzam Water, Dual Rear AC, High Speed WiFi',
    description: 'Flagship luxury SUV for VIP transfers, VIP delegations, and Umrah families.',
    displayOrder: 1
  },
  {
    name: 'Toyota Camry 2025',
    category: 'sedan',
    year: 2025,
    passengerCapacity: 4,
    luggageCapacity: 4,
    startingPrice: 160,
    imageUrl: '/images/fleet/toyota-camry.jpg',
    features: 'Comfort AC, 4 Medium Bags, USB Fast Charging, Smooth Quiet Highway Drive',
    description: 'Executive sedan perfect for solo pilgrims, couples, and small families.',
    displayOrder: 2
  },
  {
    name: 'Hyundai Staria VIP 2025',
    category: 'van',
    year: 2025,
    passengerCapacity: 8,
    luggageCapacity: 8,
    startingPrice: 200,
    imageUrl: '/images/fleet/staria.jpg',
    features: 'VIP Captain Reclining Chairs, 8 Bags, Panoramic Windows, Dual AC, WiFi',
    description: 'Futuristic luxury van offering first-class lounge comfort for Umrah groups.',
    displayOrder: 3
  },
  {
    name: 'Toyota HiAce High Roof',
    category: 'van',
    year: 2025,
    passengerCapacity: 12,
    luggageCapacity: 12,
    startingPrice: 250,
    imageUrl: '/images/fleet/toyota-hiace.jpg',
    features: 'High Roof Stand-Up Space, 12 Bags Trunk, Powerful Group AC, Microphone System',
    description: 'The preferred choice for medium-sized Umrah groups and large family transfers.',
    displayOrder: 4
  },
  {
    name: 'Ford Taurus Executive 2025',
    category: 'sedan',
    year: 2025,
    passengerCapacity: 4,
    luggageCapacity: 3,
    startingPrice: 200,
    imageUrl: '/images/fleet/ford-taurus.jpg',
    features: 'Ultra Silent Cabin, 3 Bags, Luxury Interior, Smooth Highway Suspension',
    description: 'Modern executive sedan tailored for comfort on the Jeddah-Makkah highway.',
    displayOrder: 5
  },
  {
    name: 'Lexus ES300h Hybrid 2026',
    category: 'sedan',
    year: 2026,
    passengerCapacity: 4,
    luggageCapacity: 3,
    startingPrice: 250,
    imageUrl: '/images/fleet/lexus-es300h.jpg',
    features: 'Hybrid VIP Luxury, Premium Mark Levinson Audio, Ultra Quiet, Leather Interior',
    description: 'First-class luxury sedan for VIP dignitaries and discerning pilgrims.',
    displayOrder: 6
  },
  {
    name: 'Toyota Coaster 2025',
    category: 'bus',
    year: 2025,
    passengerCapacity: 22,
    luggageCapacity: 25,
    startingPrice: 350,
    imageUrl: '/images/fleet/toyota-coaster.jpg',
    features: '22 Reclining Seats, 25 Bags Cargo, Powerful Roof AC, PA Mic System for Guide',
    description: 'Luxury minibus ideal for group Ziyarat tours and large Umrah family groups.',
    displayOrder: 7
  },
  {
    name: 'VIP Coach Bus 2025',
    category: 'bus',
    year: 2025,
    passengerCapacity: 50,
    luggageCapacity: 55,
    startingPrice: 400,
    imageUrl: '/images/fleet/bus-2025.jpg',
    features: '50 Reclining Velvet Seats, Underfloor Luggage Compartments, Onboard WC, Tour PA',
    description: 'Full-size 50-passenger luxury tour coach for Umrah delegations and agencies.',
    displayOrder: 8
  }
];

export default function ManageVehicles() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { notifyVehicleUpdated } = useBookingTracker();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modal state
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<any>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVehicles = async (isBackground = false) => {
    if (!isBackground) {
      const cached = sessionStorage.getItem('vehicles_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setVehicles(parsed);
            setLoading(false);
          }
        } catch (e) {}
      } else {
        setLoading(true);
      }
    }

    const token = localStorage.getItem('adminToken');
    try {
      let data: any[] | null = null;
      if (token) {
        const res = await fetch('/api/admin/vehicles', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });
        if (res.ok) {
          const parsed = await res.json();
          if (Array.isArray(parsed) && parsed.length > 0) {
            data = parsed;
          }
        }
      }

      // Fallback: If admin token is invalid or endpoint returned empty/non-array, retrieve from /api/vehicles
      if (!data) {
        const fallbackRes = await fetch('/api/vehicles', { cache: 'no-store' });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData)) {
            data = fallbackData;
          }
        }
      }

      const finalData = Array.isArray(data) ? data : [];
      setVehicles(finalData);
      sessionStorage.setItem('vehicles_cache', JSON.stringify(finalData));
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      // Final attempt fallback
      try {
        const fallbackRes = await fetch('/api/vehicles', { cache: 'no-store' });
        const fallbackData = await fallbackRes.json();
        const finalFallback = Array.isArray(fallbackData) ? fallbackData : [];
        setVehicles(finalFallback);
        sessionStorage.setItem('vehicles_cache', JSON.stringify(finalFallback));
      } catch (e) {
        setVehicles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchVehicles(); 
    const handleRefresh = () => fetchVehicles(true);
    window.addEventListener('faris_vehicles_updated', handleRefresh);
    window.addEventListener('focus', handleRefresh);
    return () => {
      window.removeEventListener('faris_vehicles_updated', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Safe client-side canvas compression for uploaded images (max 1200x800, WebP/JPEG 0.85)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1200;
          const maxHeight = 800;
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try WebP first for optimal size, fallback to JPEG
          try {
            const webpData = canvas.toDataURL('image/webp', 0.85);
            if (webpData.startsWith('data:image/webp')) {
              resolve(webpData);
              return;
            }
          } catch (e) {
            // ignore
          }
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = event.target?.result as string;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const compressedDataUrl = await compressImage(file);
      setCurrent((prev: any) => ({ ...prev, imageUrl: compressedDataUrl }));
      showToast(isAr ? 'تم تحميل الصورة وتحسين حجمها بنجاح' : 'Image uploaded & optimized successfully');
    } catch (err) {
      console.error(err);
      showToast(isAr ? 'فشل معالجة الصورة، يرجى المحاولة مرة أخرى' : 'Failed to process image', 'error');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current.name || !current.name.trim()) {
      showToast(isAr ? 'يرجى إدخال اسم المركبة' : 'Please enter vehicle name', 'error');
      return;
    }

    setIsSaving(true);
    const method = current.id ? 'PUT' : 'POST';
    const url = current.id ? `/api/admin/vehicles/${current.id}` : '/api/admin/vehicles';
    
    // Prepare clean payload
    const payload: any = {
      name: current.name.trim(),
      year: Number(current.year) || 2025,
      passengerCapacity: Number(current.passengerCapacity) || 4,
      luggageCapacity: Number(current.luggageCapacity) || 3,
      startingPrice: Number(current.startingPrice) || 0,
      category: current.category || 'suv',
      status: current.status || 'active',
      imageUrl: current.imageUrl?.trim() || '',
      features: current.features?.trim() || '',
      description: current.description?.trim() || '',
      displayOrder: Number(current.displayOrder) || 0,
      updatedAt: current.updatedAt // pass client version for optimistic lock
    };

    if (current.id) {
      payload.id = Number(current.id);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.reload();
        return;
      }
      
      if (res.status === 409) {
        const errorData = await res.json();
        showToast(errorData.error || (isAr ? "تعارض: تم تعديل هذه المركبة بواسطة مستخدم آخر." : "Conflict: Vehicle modified by another user."), 'error');
        fetchVehicles(true);
        return;
      }

      const result = await res.json();
      if (res.ok && result.success) {
        showToast(isAr ? 'تم حفظ ومزامنة بيانات السيارة بنجاح وتحديث الموقع' : 'Vehicle details saved and synced to public site!');
        setIsEditing(false);
        fetchVehicles(true);
        notifyVehicleUpdated();
      } else {
        showToast(result.error || (isAr ? 'فشل حفظ المركبة' : 'Failed to save vehicle'), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(isAr ? 'خطأ في الاتصال بالسيرفر' : 'Connection error while saving', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isAr ? "هل أنت متأكد من رغبتك في أرشفة هذه السيارة من الأسطول؟" : "Are you sure you want to archive/remove this vehicle from active fleet?")) return;
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.reload();
        return;
      }
      if (res.ok) {
        showToast(isAr ? 'تم أرشفة السيارة من الأسطول' : 'Vehicle archived from active fleet');
        fetchVehicles();
        notifyVehicleUpdated();
      }
    } catch (e) {
      showToast(isAr ? 'فشل أرشفة السيارة' : 'Failed to archive vehicle', 'error');
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
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.reload();
        return;
      }
      if (res.ok) {
        showToast(isAr ? `تم تعيين السيارة: ${newStatus === 'active' ? 'نشطة ومتاحة للزوار' : 'مؤرشفة وغير ظاهرة'}` : `Vehicle status updated to ${newStatus}`);
        fetchVehicles();
        notifyVehicleUpdated();
      }
    } catch (e) {
      showToast(isAr ? 'فشل تحديث الحالة' : 'Failed to toggle vehicle status', 'error');
    }
  };

  const duplicateVehicle = (v: any) => {
    setCurrent({
      name: `${v.name} (Copy)`,
      year: v.year || 2025,
      passengerCapacity: v.passengerCapacity || 4,
      luggageCapacity: v.luggageCapacity || 3,
      startingPrice: v.startingPrice || 200,
      category: v.category || 'suv',
      status: 'active',
      imageUrl: v.imageUrl || '',
      features: v.features || '',
      description: v.description || '',
      displayOrder: (v.displayOrder || 0) + 1
    });
    setIsEditing(true);
    showToast(isAr ? 'تم نسخ بيانات المركبة - يمكنك التعديل والحفظ كمركبة جديدة' : 'Vehicle cloned - edit and save as new entry');
  };

  const applyPreset = (preset: typeof FLEET_PRESETS[0]) => {
    setCurrent((prev: any) => ({
      ...prev,
      name: preset.name,
      category: preset.category,
      year: preset.year,
      passengerCapacity: preset.passengerCapacity,
      luggageCapacity: preset.luggageCapacity,
      startingPrice: preset.startingPrice,
      imageUrl: preset.imageUrl,
      features: preset.features,
      description: preset.description,
      displayOrder: preset.displayOrder,
      status: 'active'
    }));
    setShowGallery(false);
    showToast(isAr ? `تم تطبيق قالب: ${preset.name}` : `Applied preset: ${preset.name}`);
  };

  // Filter logic
  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchesSearch = (v.name || '').toLowerCase().includes(q) || 
                          (v.category || '').toLowerCase().includes(q) ||
                          (v.features || '').toLowerCase().includes(q) ||
                          (v.description || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && (v.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
    return true;
  });

  // Summary Metrics
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const archivedVehicles = vehicles.filter(v => v.status !== 'active').length;
  const avgPrice = totalVehicles > 0 
    ? Math.round(vehicles.reduce((acc, v) => acc + (Number(v.startingPrice) || 0), 0) / totalVehicles) 
    : 0;

  return (
    <div className="space-y-6">
      <VehicleSyncMonitor />
      
      {/* Toast Notification */}
      {toast && (
        <div className={`p-4 rounded-xl text-white shadow-xl flex items-center justify-between text-sm font-bold animate-fade-in fixed bottom-6 right-6 z-50 max-w-md ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-[var(--color-saudi-green)]'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white ml-3"><X size={16} /></button>
        </div>
      )}

      {/* Top Header Card with Quick Stats */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/90 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[var(--color-saudi-green)] flex items-center justify-center font-bold">
                <Car size={18} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isAr ? 'إدارة أسطول المركبات ومزامنة الموقع' : 'VIP Fleet Management & Live Sync'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isAr 
                ? 'أي تعديل على صور المركبات أو أسمائها أو مميزاتها ينعكس فوراً ومباشرة على الموقع وحاسبة الحجز' 
                : 'All changes to images, texts, features, and rates sync instantly to the public website & booking engine.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* View Live Public Page Button */}
            <a 
              href="/vehicles" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Eye size={15} />
              <span>{isAr ? 'معاينة صفحة الأسطول' : 'View Public Fleet'}</span>
              <ExternalLink size={12} className="opacity-60" />
            </a>

            {/* Refresh Button */}
            <button
              onClick={() => fetchVehicles(true)}
              disabled={loading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title={isAr ? 'تحديث القائمة' : 'Refresh List'}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Add Vehicle Button */}
            <button 
              onClick={() => { 
                setCurrent({ 
                  name: '', 
                  passengerCapacity: 4, 
                  luggageCapacity: 3, 
                  startingPrice: 200, 
                  status: 'active',
                  category: 'suv',
                  year: 2025,
                  imageUrl: '',
                  features: 'VIP Chauffeur, Chilled Water, Free WiFi, USB Charging',
                  description: '',
                  displayOrder: vehicles.length + 1
                }); 
                setIsEditing(true); 
              }}
              className="px-4 py-2.5 bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>{isAr ? '+ إضافة سيارة جديدة' : '+ Add New Vehicle'}</span>
            </button>
          </div>
        </div>

        {/* Fleet KPI Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isAr ? 'إجمالي الأسطول' : 'Total Vehicles'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
              {totalVehicles}
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              {isAr ? 'النشطة على الموقع' : 'Active On Site'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-[var(--color-saudi-green)] mt-1 block">
              {activeVehicles}
            </span>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              {isAr ? 'المؤرشفة / المخفية' : 'Archived / Hidden'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-700 mt-1 block">
              {archivedVehicles}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isAr ? 'متوسط السعر المبدئي' : 'Average Fare'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1 block">
              {avgPrice} <span className="text-xs font-bold text-slate-500">{t('sar')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs, Search & View Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-[var(--color-saudi-green)] text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'الكل' : 'All Fleet'} ({totalVehicles})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active' 
                ? 'bg-[var(--color-saudi-green)] text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'النشطة فقط' : 'Active Only'} ({activeVehicles})
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'archived' 
                ? 'bg-slate-800 text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'المؤرشفة' : 'Archived'} ({archivedVehicles})
          </button>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">{isAr ? 'كل الفئات' : 'All Categories'}</option>
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="van">Van</option>
            <option value="bus">Bus</option>
            <option value="luxury">Luxury / VIP</option>
          </select>
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder={isAr ? 'بحث بالاسم، الفئة، أو الميزات...' : 'Search model, features, category...'} 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-2xs text-[var(--color-saudi-green)]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <Car size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-2xs text-[var(--color-saudi-green)]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Fleet View: Cards Grid OR Detailed Table */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[var(--color-saudi-green)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-600">{isAr ? 'جاري تحميل الأسطول والمزامنة...' : 'Loading VIP Fleet...'}</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200/90 shadow-xs">
          <Car size={44} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">{isAr ? 'لا توجد مركبات مطابقة' : 'No matching vehicles found'}</h3>
          <p className="text-xs text-slate-400 mt-1">{isAr ? 'جرب تغيير كلمة البحث أو الفلتر' : 'Try adjusting your search query or status filter'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(v => {
            const displayImage = getVehicleImageByName(v.name, v.imageUrl);
            return (
              <div 
                key={v.id} 
                className="bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                  <img 
                    src={displayImage} 
                    alt={v.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    onError={(e: any) => {
                      e.target.src = '/images/fleet/gmc-xl.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                  {/* Status & Category Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${
                      v.status === 'active' 
                        ? 'bg-[var(--color-saudi-green)] text-white' 
                        : 'bg-slate-700 text-white'
                    }`}>
                      {v.status === 'active' ? (isAr ? 'نشط على الموقع' : 'Active') : (isAr ? 'مؤرشف' : 'Archived')}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md">
                    {v.category?.toUpperCase() || 'VIP'}
                  </div>

                  {/* Vehicle Name Banner */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-lg font-black tracking-tight drop-shadow-md text-white truncate">
                      {v.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-emerald-200 font-semibold">
                      <span>{v.year || '2025'} {t('model')}</span>
                      <span>•</span>
                      <span>{v.startingPrice || 0} {t('sar')}</span>
                    </div>
                  </div>
                </div>

                {/* Specs and Features */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Capacities Grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50/90 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-[var(--color-saudi-green)]" />
                      <span>{v.passengerCapacity} {isAr ? 'ركاب' : 'Passengers'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-[var(--color-luxury-gold)]" />
                      <span>{v.luggageCapacity} {isAr ? 'حقائب' : 'Luggage'}</span>
                    </span>
                  </div>

                  {/* Features Tag List */}
                  {v.features && (
                    <div className="flex flex-wrap gap-1.5">
                      {v.features.split(',').map((feat: string, i: number) => (
                        <span key={i} className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                          {feat.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {v.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                      {v.description}
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
                  <button
                    onClick={() => toggleStatus(v)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      v.status === 'active' 
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200' 
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {v.status === 'active' ? (isAr ? 'إخفاء من الموقع' : 'Hide from Site') : (isAr ? 'تفعيل على الموقع' : 'Activate on Site')}
                  </button>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => duplicateVehicle(v)} 
                      title={isAr ? 'نسخ المركبة' : 'Duplicate Vehicle'}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                    >
                      <Copy size={15} />
                    </button>
                    <button 
                      onClick={() => { setCurrent(v); setIsEditing(true); }} 
                      title={isAr ? 'تعديل البيانات' : 'Edit Vehicle'}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(v.id)} 
                      title={isAr ? 'أرشفة من الأسطول' : 'Archive Vehicle'}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="p-4">{isAr ? 'الصورة والموديل' : 'Vehicle & Model'}</th>
                  <th className="p-4">{isAr ? 'الفئة' : 'Category'}</th>
                  <th className="p-4">{isAr ? 'السعة' : 'Capacities'}</th>
                  <th className="p-4">{isAr ? 'السعر المبدئي' : 'Starting Rate'}</th>
                  <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-4 text-right">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getVehicleImageByName(v.name, v.imageUrl)} 
                          alt={v.name} 
                          className="w-14 h-10 object-cover rounded-lg border border-slate-200 shrink-0" 
                          onError={(e: any) => { e.target.src = '/images/fleet/gmc-xl.jpg'; }}
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 block text-sm">{v.name}</span>
                          <span className="text-[11px] text-slate-400 font-semibold">{v.year || '2025'} {t('model')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-700 uppercase">{v.category || 'SUV'}</span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5 font-semibold text-slate-600">
                        <span className="flex items-center gap-1"><Users size={12} className="text-emerald-700" /> {v.passengerCapacity} {isAr ? 'ركاب' : 'Pax'}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12} className="text-amber-700" /> {v.luggageCapacity} {isAr ? 'حقائب' : 'Bags'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-sm text-[var(--color-saudi-green)]">
                        {v.startingPrice || 0} SAR
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        v.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {v.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'مؤرشف' : 'Archived')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button 
                          onClick={() => toggleStatus(v)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          {v.status === 'active' ? (isAr ? 'تعطيل' : 'Hide') : (isAr ? 'تفعيل' : 'Show')}
                        </button>
                        <button 
                          onClick={() => { setCurrent(v); setIsEditing(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <Edit size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT VEHICLE MODAL WITH LIVE PREVIEW */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 my-8 border border-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {current.id ? (isAr ? 'تعديل بيانات المركبة' : 'Edit Vehicle Details') : (isAr ? 'إضافة مركبة جديدة للأسطول' : 'Add New VIP Vehicle')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr ? 'البيانات والصورة المحفوظة ستظهر فوراً في صفحات الموقع والحجوزات' : 'Saved image and texts sync immediately to user website & booking widget.'}
                </p>
              </div>
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Approval Status & Firestore / DB Sync Indicator */}
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isSaving ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="font-extrabold text-slate-800">
                  {isAr ? 'حالة الاعتماد والمزامنة السحابية:' : 'Firestore & Database Sync Status:'}
                </span>
                <span className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                  isSaving 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isSaving 
                    ? (isAr ? 'جاري المزامنة (Pending Sync...)' : 'Syncing with Firestore...') 
                    : (isAr ? 'معتمد ومزامن (Approved & Synced ✓)' : 'Approved & Synced ✓')}
                </span>
              </div>
              <div className="text-slate-500 font-medium text-[11px] flex items-center gap-1.5">
                <CheckCircle size={13} className="text-[var(--color-saudi-green)]" />
                <span>{isAr ? 'محمي بقواعد المصادقة الإدارية' : 'Secured via Admin Security Rules'}</span>
              </div>
            </div>

            {/* Instant Presets Drawer / Quick Selector */}
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                  <Sparkles size={14} className="text-[var(--color-saudi-green)]" />
                  <span>{isAr ? 'قوالب وصور أسطول العمرة السريعة (نقرة واحدة للملء والصورة):' : 'Instant Umrah Fleet Presets & High-Res Images:'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGallery(!showGallery)}
                  className="text-xs font-extrabold text-[var(--color-saudi-green)] hover:underline cursor-pointer"
                >
                  {showGallery ? (isAr ? 'إخفاء المعرض' : 'Hide Presets') : (isAr ? 'عرض كل القوالب' : 'View All Presets')}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {FLEET_PRESETS.slice(0, showGallery ? FLEET_PRESETS.length : 4).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 bg-white border border-emerald-200 hover:border-emerald-400 text-slate-800 text-xs font-bold rounded-xl hover:bg-emerald-50/80 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <img src={preset.imageUrl} alt={preset.name} className="w-5 h-4 object-cover rounded-xs" />
                    <span>+ {preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form + Live Preview Layout */}
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Form Fields (Left Column, 7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Name & Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        {isAr ? 'اسم وموديل السيارة *' : 'Vehicle Model / Name *'}
                      </label>
                      <input 
                        type="text" 
                        value={current.name || ''} 
                        onChange={e => setCurrent({ ...current, name: e.target.value })} 
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                        placeholder="e.g. GMC Yukon XL 2025" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        {isAr ? 'سنة الصنع' : 'Model Year'}
                      </label>
                      <input 
                        type="number" 
                        value={current.year || 2025} 
                        onChange={e => setCurrent({ ...current, year: parseInt(e.target.value) || 2025 })} 
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                      />
                    </div>
                  </div>

                  {/* Capacities & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        {isAr ? 'سعة الركاب (أشخاص)' : 'Passenger Cap (Pax)'}
                      </label>
                      <input 
                        type="number" 
                        value={current.passengerCapacity ?? 4} 
                        onChange={e => setCurrent({ ...current, passengerCapacity: parseInt(e.target.value) || 1 })} 
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                        min={1} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        {isAr ? 'سعة الحقائب (شنط)' : 'Luggage Cap (Bags)'}
                      </label>
                      <input 
                        type="number" 
                        value={current.luggageCapacity ?? 3} 
                        onChange={e => setCurrent({ ...current, luggageCapacity: parseInt(e.target.value) || 0 })} 
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                        min={0} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        {isAr ? 'السعر المبدئي (SAR)' : 'Starting Price (SAR)'}
                      </label>
                      <input 
                        type="number" 
                        value={current.startingPrice ?? 200} 
                        onChange={e => setCurrent({ ...current, startingPrice: parseInt(e.target.value) || 0 })} 
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-black text-emerald-800 focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                        min={0}
                        required 
                      />
                    </div>
                  </div>

                  {/* Category, Status & Display Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        {isAr ? 'فئة السيارة' : 'Category'}
                      </label>
                      <select 
                        value={current.category || 'suv'} 
                        onChange={e => setCurrent({ ...current, category: e.target.value })} 
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none bg-white"
                      >
                        <option value="suv">SUV (VIP Yukon/Tahoe)</option>
                        <option value="sedan">Sedan (Camry/Taurus/Lexus)</option>
                        <option value="van">Van (Staria/HiAce/H1)</option>
                        <option value="bus">Bus / Minibus (Coaster/Coach)</option>
                        <option value="luxury">Luxury / VIP Chauffeur</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        {isAr ? 'حالة التوفر' : 'Fleet Status'}
                      </label>
                      <select 
                        value={current.status || 'active'} 
                        onChange={e => setCurrent({ ...current, status: e.target.value })} 
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none bg-white"
                      >
                        <option value="active">{isAr ? 'نشط ومتاح في الموقع' : 'Active (Visible on Site)'}</option>
                        <option value="archived">{isAr ? 'مؤرشف ومخفي' : 'Archived (Hidden)'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        {isAr ? 'ترتيب الظهور' : 'Display Order'}
                      </label>
                      <input 
                        type="number" 
                        value={current.displayOrder ?? 1} 
                        onChange={e => setCurrent({ ...current, displayOrder: parseInt(e.target.value) || 0 })} 
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                        title="1 = First, 2 = Second, etc."
                      />
                    </div>
                  </div>

                  {/* Image URL & Upload Section */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      {isAr ? 'صورة المركبة (رابط مباشر أو رفع من الجهاز)' : 'Vehicle Photo (URL or File Upload)'}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
                      <input 
                        type="text" 
                        value={current.imageUrl || ''} 
                        onChange={e => setCurrent({ ...current, imageUrl: e.target.value })} 
                        className="flex-1 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                        placeholder="/images/fleet/... or https://..." 
                      />

                      <label className={`px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer shrink-0 flex items-center justify-center gap-1.5 transition-all ${compressing ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload size={14} />
                        <span>{compressing ? (isAr ? 'جاري التحسين...' : 'Optimizing...') : (isAr ? 'رفع من الجهاز' : 'Upload File')}</span>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          className="hidden" 
                          disabled={compressing}
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isAr 
                        ? 'ملاحظة: يتم ضغط الصور المرفوعة تلقائياً لتحميل الموقع بسرعة فائقة وتوفير استهلاك البيانات' 
                        : 'Uploaded images are automatically compressed to high quality WebP/JPEG for instant loading & minimal data usage.'}
                    </p>
                  </div>

                  {/* Features Tag List */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      {isAr ? 'الميزات والخدمات (مفصولة بفاصلة)' : 'Features & Amenities (comma-separated)'}
                    </label>
                    <input 
                      type="text" 
                      value={current.features || ''} 
                      onChange={e => setCurrent({ ...current, features: e.target.value })} 
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                      placeholder="Free WiFi, Chilled Zamzam Water, Leather Reclining Seats, USB Charging" 
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      {isAr ? 'الوصف والنص الإضافي' : 'Vehicle Description & pilgrim notes'}
                    </label>
                    <textarea 
                      value={current.description || ''} 
                      onChange={e => setCurrent({ ...current, description: e.target.value })} 
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none h-20" 
                      placeholder={isAr ? 'مثال: سيارة فارهة مجهزة بأعلى وسائل الراحة لرحلات العمرة بين جدة ومكة والمدينة...' : 'e.g. Flagship VIP transport with executive chauffeur for luxury Umrah transfers between Jeddah, Makkah, and Madinah...'}
                    />
                  </div>
                </div>

                {/* Live Card Preview (Right Column, 5 Cols) */}
                <div className="lg:col-span-5 bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Eye size={14} className="text-[var(--color-saudi-green)]" />
                      {isAr ? 'معاينة حية كما ستظهر للزوار' : 'Live Website Card Preview'}
                    </span>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {isAr ? 'مباشر' : 'Sync Live'}
                    </span>
                  </div>

                  {/* Preview Card Mockup */}
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200">
                    <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                      <img 
                        src={getVehicleImageByName(current.name, current.imageUrl)} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        onError={(e: any) => { e.target.src = '/images/fleet/gmc-xl.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      <div className="absolute top-2.5 right-2.5 bg-[var(--color-saudi-green)] text-white px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                        {current.year || '2025'} {t('model')}
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <h4 className="text-sm font-black truncate text-white">
                          {current.name || (isAr ? 'اسم السيارة' : 'Vehicle Name')}
                        </h4>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold bg-slate-50 p-2 rounded-xl text-slate-700">
                        <span>👥 {current.passengerCapacity || 4} {t('pass')}</span>
                        <span>🧳 {current.luggageCapacity || 3} {t('luggage_short')}</span>
                      </div>

                      {current.features && (
                        <div className="flex flex-wrap gap-1">
                          {current.features.split(',').slice(0, 3).map((feat: string, i: number) => (
                            <span key={i} className="text-[9px] font-semibold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-md">
                              {feat.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {current.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                          {current.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-amber-700 uppercase font-bold block">{t('starting_from')}</span>
                          <span className="text-base font-black text-[var(--color-saudi-green)]">
                            {current.startingPrice || 0} <span className="text-xs font-bold text-slate-500">SAR</span>
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md">
                          ✨ VIP Chauffeur
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  disabled={isSaving}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer text-slate-700"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white rounded-xl font-black text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isAr ? 'جاري المزامنة والحفظ...' : 'Saving & Syncing...'}</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{isAr ? 'حفظ ومزامنة مع الموقع' : 'Save & Sync to Site'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
