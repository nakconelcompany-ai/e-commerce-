'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatMoney } from '@nuvora/shared';
import { Package, User, LogOut, CheckCircle, Clock, Truck, ShieldCheck, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, token, login, logout } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:4000/api/v1/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch(() => {});
    }
  }, [token]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isRegister ? 'register' : 'login';
    const body: any = { email, password };
    if (isRegister) {
      body.phone = phone;
      body.role = role;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/v1/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      login(data.accessToken, data.user);
    } catch (err: any) {
      alert(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-8 sm:my-16 px-4 py-8 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xl space-y-6">
        <div className="text-center space-y-1 sm:space-y-2">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-brand-600 mb-2">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {isRegister
              ? 'Join Nuvora to shop authentic products or start your own verified seller store.'
              : 'Sign in to access your orders, track shipments, and manage support tickets.'}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number (Nigeria)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
                  placeholder="+2348012345678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold"
                >
                  <option value="CUSTOMER">I want to shop & buy products</option>
                  <option value="SELLER">I want to open a Seller Store</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register Now"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-20 md:pb-8">
      {/* Profile Header Card */}
      <div className="bg-dark-900 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-500 text-dark-900 font-black text-xl sm:text-2xl flex items-center justify-center border-2 border-amber-300 shadow-lg shrink-0">
            {user.email.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest block">{user.role} ACCOUNT</span>
            <h2 className="text-xl sm:text-2xl font-extrabold truncate">{user.email}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user.phone || 'Phone not set'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/support"
            className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl bg-dark-800 text-gray-200 text-xs font-semibold border border-gray-700 flex items-center justify-center gap-1.5"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-amber-400" /> Support Desk
          </Link>
          <button
            onClick={logout}
            className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-red-400 text-xs font-semibold border border-gray-700 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-sm">
        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <Package className="w-5 sm:w-6 h-5 sm:h-6 text-brand-500" />
          <span>My Orders ({orders.length})</span>
        </h3>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">You haven&apos;t placed any orders yet.</div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-gray-900 text-sm sm:text-base">#{order.orderNumber}</span>
                    <span className="text-gray-500 block text-[11px] sm:text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-amber-100 text-amber-900 uppercase">
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="font-black text-sm text-dark-900">{formatMoney(order.totalAmountMinor, 'NGN')}</span>
                  </div>
                </div>

                {/* Sub-orders and items */}
                <div className="space-y-2">
                  {order.sellerOrders?.map((so: any) => (
                    <div key={so.id} className="p-3 bg-white rounded-xl border border-gray-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-gray-800">
                        <span>Seller: {so.seller?.storeName || 'Direct Store'}</span>
                        <span className="text-[10px] uppercase font-bold text-amber-600">{so.status.replace('_', ' ')}</span>
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        {so.items?.map((it: any) => `${it.productTitle} (x${it.quantity})`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
