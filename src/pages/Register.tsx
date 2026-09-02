import Breadcrumbs from '../components/Breadcrumbs';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Register' }]} />
      <div className="min-h-screen bg-[var(--color-soft-ivory)] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-emerald-50 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--color-dark-charcoal)] mb-2">Create Account</h2>
          <p className="text-[var(--color-dark-charcoal)]/60 text-sm">Join Faris VIP Umrah Transport to book rides easily and track history.</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="bg-gray-50 border border-gray-300 p-3 rounded text-sm text-[var(--color-dark-charcoal)] font-medium focus:ring-1 focus:ring-[var(--color-saudi-green)] outline-none transition-colors" aria-label="Full Name" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-700 mb-1">Phone Number</label>
            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..." className="bg-gray-50 border border-gray-300 p-3 rounded text-sm text-[var(--color-dark-charcoal)] font-medium focus:ring-1 focus:ring-[var(--color-saudi-green)] outline-none transition-colors" aria-label="Phone Number" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-700 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-50 border border-gray-300 p-3 rounded text-sm text-[var(--color-dark-charcoal)] font-medium focus:ring-1 focus:ring-[var(--color-saudi-green)] outline-none transition-colors" aria-label="Email Address" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-50 border border-gray-300 p-3 rounded text-sm text-[var(--color-dark-charcoal)] font-medium focus:ring-1 focus:ring-[var(--color-saudi-green)] outline-none transition-colors" aria-label="Password" />
          </div>
          <button type="submit" className="w-full bg-[var(--color-saudi-green)] text-white py-4 rounded font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-saudi-emerald)] transition-colors shadow-lg mt-6">
            Create Account
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-[var(--color-dark-charcoal)]/60 font-medium">
          Already have an account? <Link to="/login" className="text-[var(--color-saudi-green)] font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  
    </>
  );
}
