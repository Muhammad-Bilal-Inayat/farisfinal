import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, MapPin, CheckCircle2, Clock, Play, LogOut, ShieldCheck, ExternalLink, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

interface Booking {
  id: number;
  bookingId: string;
  customerName: string;
  phone: string;
  whatsapp?: string;
  pickup: string;
  destination: string;
  vehicleNameSnapshot?: string;
  passengers: number;
  luggage?: number;
  date: string;
  time: string;
  status: string;
  driverId?: number;
  driverNameSnapshot?: string;
  driverPhoneSnapshot?: string;
}

export default function DriverDashboard({ onLogout }: { onLogout: () => void }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [toast, setToast] = useState<string | null>(null);

  const fetchDriverBookings = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/driver/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverBookings();
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchDriverBookings();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/driver/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setToast(isAr ? 'تم تحديث حالة الرحلة بنجاح' : 'Trip status updated successfully');
        fetchDriverBookings();
        setTimeout(() => setToast(null), 3000);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (e) {
      alert('Error updating status');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter(b => {
    if (filter === 'today') return b.date === todayStr;
    if (filter === 'upcoming') return b.date > todayStr && b.status !== 'Completed' && b.status !== 'Cancelled';
    if (filter === 'completed') return b.status === 'Completed';
    return true;
  });

  const stats = {
    total: bookings.length,
    today: bookings.filter(b => b.date === todayStr).length,
    upcoming: bookings.filter(b => b.date > todayStr && b.status !== 'Completed').length,
    completed: bookings.filter(b => b.status === 'Completed').length
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-saudi-emerald)] flex items-center justify-center text-[var(--color-luxury-gold)] shadow-md">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[var(--color-luxury-gold)] tracking-wide">
              {isAr ? 'بوابة السائقين المحترفين' : 'VIP Chauffeur Portal'}
            </h1>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Driver On Duty</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="admin" />
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
      </header>

      {toast && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-center text-xs font-bold shadow-lg animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div onClick={() => setFilter('all')} className={`bg-slate-800/80 border p-4 rounded-2xl cursor-pointer transition-all ${filter === 'all' ? 'border-[var(--color-luxury-gold)] shadow-md' : 'border-slate-700/60'}`}>
            <div className="text-slate-400 text-xs font-bold uppercase">Total Assigned</div>
            <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
          </div>
          <div onClick={() => setFilter('today')} className={`bg-slate-800/80 border p-4 rounded-2xl cursor-pointer transition-all ${filter === 'today' ? 'border-[var(--color-luxury-gold)] shadow-md' : 'border-slate-700/60'}`}>
            <div className="text-amber-400 text-xs font-bold uppercase">Today's Trips</div>
            <div className="text-2xl font-black text-white mt-1">{stats.today}</div>
          </div>
          <div onClick={() => setFilter('upcoming')} className={`bg-slate-800/80 border p-4 rounded-2xl cursor-pointer transition-all ${filter === 'upcoming' ? 'border-[var(--color-luxury-gold)] shadow-md' : 'border-slate-700/60'}`}>
            <div className="text-blue-400 text-xs font-bold uppercase">Upcoming Trips</div>
            <div className="text-2xl font-black text-white mt-1">{stats.upcoming}</div>
          </div>
          <div onClick={() => setFilter('completed')} className={`bg-slate-800/80 border p-4 rounded-2xl cursor-pointer transition-all ${filter === 'completed' ? 'border-[var(--color-luxury-gold)] shadow-md' : 'border-slate-700/60'}`}>
            <div className="text-emerald-400 text-xs font-bold uppercase">Completed</div>
            <div className="text-2xl font-black text-white mt-1">{stats.completed}</div>
          </div>
        </div>

        {/* Trips List Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="text-[var(--color-luxury-gold)]" size={20} />
            <span>{isAr ? 'رحلاتي المخصصة' : 'My Assigned Trips'}</span>
          </h2>
          <div className="text-xs text-slate-400">
            Showing: <span className="font-bold text-white uppercase">{filter}</span>
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading assigned trips...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-12 text-center text-slate-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-40 text-[var(--color-luxury-gold)]" />
            <p className="font-bold text-sm">No assigned trips found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBookings.map(b => {
              const customerPhone = b.whatsapp || b.phone;
              const whatsappUrl = `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalamu Alaikum ${b.customerName}, I am your assigned chauffeur for your upcoming trip from ${b.pickup} to ${b.destination}.`)}`;

              return (
                <div key={b.id} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-saudi-emerald)]/10 rounded-bl-full pointer-events-none" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                      <span className="font-mono text-xs font-extrabold text-[var(--color-luxury-gold)] bg-black/30 px-3 py-1 rounded-lg border border-slate-700">
                        {b.bookingId}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        b.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        b.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-300/30'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Passenger / Customer</div>
                        <div className="text-sm font-bold text-white mt-0.5">{b.customerName}</div>
                        <div className="text-xs text-slate-300 font-mono mt-0.5">{b.phone}</div>
                      </div>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <Phone size={14} />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    {/* Route Info */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Pickup Location</span>
                          <span className="font-semibold text-white">{b.pickup}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin size={16} className="text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Destination</span>
                          <span className="font-semibold text-white">{b.destination}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trip Date, Time & Vehicle */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-900/40 p-3 rounded-xl text-center text-xs border border-slate-700/40">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Date</span>
                        <span className="font-semibold text-white">{b.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Time</span>
                        <span className="font-semibold text-white">{b.time}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Vehicle</span>
                        <span className="font-semibold text-[var(--color-luxury-gold)] truncate block">{b.vehicleNameSnapshot || 'VIP Vehicle'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="pt-2 border-t border-slate-700/80 flex items-center gap-2">
                    {b.status !== 'In Progress' && b.status !== 'Completed' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'In Progress')}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Play size={14} />
                        <span>Mark In Progress</span>
                      </button>
                    )}

                    {b.status !== 'Completed' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'Completed')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Mark Completed</span>
                      </button>
                    )}

                    {b.status === 'Completed' && (
                      <div className="w-full py-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-center rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} />
                        <span>Trip Completed Successfully</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
