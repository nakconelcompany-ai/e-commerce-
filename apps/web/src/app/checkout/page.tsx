'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatMoney } from '@nuvora/shared';
import { ShieldCheck, CreditCard, Lock, MapPin, Truck } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalMinor, clearCart } = useCart();
  const { token, user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('Lagos');
  const [streetAddress, setStreetAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-gray-500">
        Your cart is empty. Please add items before checking out.
      </div>
    );
  }

  // Count seller shipments
  const sellerIds = Array.from(new Set(items.map((i) => i.sellerId)));
  const deliveryFeeMinor = sellerIds.length * 150000;
  const grandTotalMinor = totalMinor + deliveryFeeMinor;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please sign in or register to complete your order checkout.');
      router.push('/account');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order via NestJS API
      const orderRes = await fetch(`${API_BASE_URL}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deliveryAddress: { fullName, phone, state, city, streetAddress },
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // 2. Initialize Paystack Online Payment
      const payRes = await fetch(`${API_BASE_URL}/api/v1/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: orderData.id }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.message || 'Failed to initialize online payment');
      }

      clearCart();
      window.location.href = payData.authorizationUrl;
    } catch (err: any) {
      alert(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-20 md:pb-8">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
        <Lock className="w-5 sm:w-6 h-5 sm:h-6 text-brand-500" />
        <span>Secure Multi-Seller Checkout</span>
      </h1>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-brand-600" /> Delivery Address Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Ogunlesi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +2348012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 text-sm font-medium"
                >
                  <option value="Lagos">Lagos State</option>
                  <option value="Abuja">FCT Abuja</option>
                  <option value="Rivers">Rivers State (Port Harcourt)</option>
                  <option value="Oyo">Oyo State (Ibadan)</option>
                  <option value="Kano">Kano State</option>
                  <option value="Delta">Delta State</option>
                  <option value="Enugu">Enugu State</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City / LGA</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ikeja, Lekki Phase 1"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Street Address</label>
              <textarea
                required
                rows={2}
                placeholder="House number, Street name, Nearest Landmark..."
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl p-3 sm:p-4 text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2 border-b border-gray-100 pb-3">
              <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-brand-600" /> Escrow Payment Guarantee
            </h3>
            <div className="p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
              <ShieldCheck className="w-5 sm:w-6 h-5 sm:h-6 text-brand-600 shrink-0" />
              <span>You will complete payment via Paystack (Cards, Bank Transfer, USSD). Funds are held in escrow until delivery is verified.</span>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4 sm:space-y-6 shadow-sm">
          <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-3">Checkout Totals</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-gray-900">{formatMoney(totalMinor, 'NGN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee ({sellerIds.length} shipments)</span>
              <span className="font-semibold text-gray-900">{formatMoney(deliveryFeeMinor, 'NGN')}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-extrabold text-dark-900">
              <span>Total Payable</span>
              <span className="text-lg gold-gradient-text">
                {formatMoney(grandTotalMinor, 'NGN')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Initializing Paystack...' : 'Pay with Paystack'}
          </button>
        </div>
      </form>
    </div>
  );
}
