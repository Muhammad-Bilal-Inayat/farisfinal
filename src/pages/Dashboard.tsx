import Breadcrumbs from '../components/Breadcrumbs';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UserDashboard() {
  const { user, token, loading, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (user && token) {
      fetch(`/api/bookings?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => setBookings(data))
        .catch(console.error);
    }
  }, [user, token]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <div className="min-h-screen bg-[var(--color-soft-ivory)] py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-dark-charcoal)]">Welcome, {user.name}</h1>
            <p className="text-[var(--color-dark-charcoal)]/60 mt-1">Manage your bookings and profile details.</p>
          </div>
          <button onClick={logout} className="text-[11px] font-bold uppercase tracking-widest text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 transition-colors">
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl border border-emerald-50 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-[var(--color-dark-charcoal)] border-b border-emerald-50 pb-4 mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-medium text-[var(--color-dark-charcoal)]/70">
            <div><span className="block text-[10px] uppercase text-emerald-500 mb-1">Name</span>{user.name}</div>
            <div><span className="block text-[10px] uppercase text-emerald-500 mb-1">Email</span>{user.email}</div>
            <div><span className="block text-[10px] uppercase text-emerald-500 mb-1">Phone</span>{user.phone}</div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[var(--color-dark-charcoal)] mb-4">Booking History</h2>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-emerald-50 p-12 text-center shadow-sm">
            <Calendar className="mx-auto text-emerald-200 mb-4" size={48} />
            <p className="text-[var(--color-dark-charcoal)]/60 mb-6">You haven't made any bookings yet.</p>
            <Link to="/booking" className="bg-[var(--color-saudi-green)] text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs shadow-lg inline-block">Book a Ride</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-emerald-50 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-gray-50 text-[var(--color-saudi-green)] px-2 py-1 rounded">{b.bookingId}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${b.status === 'Pending' ? 'bg-yellow-500 text-white border border-yellow-600' : b.status === 'Confirmed' ? 'bg-[var(--color-saudi-green)] text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-dark-charcoal)] font-bold text-lg">
                    {b.pickup} <MapPin size={16} className="text-emerald-300 mx-1" /> {b.destination}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-dark-charcoal)]/60 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {b.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {b.time}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-between">
                  <div className="text-2xl font-bold text-[var(--color-saudi-green)]">{b.price} <span className="text-xs">{t('sar')}</span></div>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-[var(--color-saudi-green)] mt-2">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  
    </>
  );
}
