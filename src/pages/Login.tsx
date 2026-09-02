import Breadcrumbs from '../components/Breadcrumbs';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Login' }]} />
      <div className="min-h-screen bg-[var(--color-soft-ivory)] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-emerald-50 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--color-dark-charcoal)] mb-2">Welcome Back</h2>
          <p className="text-[var(--color-dark-charcoal)]/60 text-sm">Sign in to view your bookings and manage your profile.</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-700 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-50 border border-gray-300 p-3 rounded text-sm text-[var(--color-dark-charcoal)] font-medium focus:ring-1 focus:ring-[var(--color-saudi-green)] outline-none transition-colors" aria-label="Email Address" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-50 border border-gray-300 p-3 rounded text-sm text-[var(--color-dark-charcoal)] font-medium focus:ring-1 focus:ring-[var(--color-saudi-green)] outline-none transition-colors" aria-label="Password" />
          </div>
          <button type="submit" className="w-full bg-[var(--color-saudi-green)] text-white py-4 rounded font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-saudi-emerald)] transition-colors shadow-lg mt-6">
            Sign In
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-[var(--color-dark-charcoal)]/60 font-medium">
          Don't have an account? <Link to="/register" className="text-[var(--color-saudi-green)] font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  
    </>
  );
}
