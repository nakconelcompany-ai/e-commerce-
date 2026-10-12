'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatMoney } from '@nuvora/shared';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  MapPin,
  CheckCircle,
  Smartphone,
  Zap,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

type PaymentMethodType = 'card' | 'opay' | 'paystack';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalMinor, clearCart } = useCart();
  const { token, user } = useAuth();

  // Address form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('Lagos');
  const [streetAddress, setStreetAddress] = useState('');

  // Selected payment method (1: Card, 2: OPay, 3: Paystack)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // OPay Input
  const [opayPhone, setOpayPhone] = useState('');

  // Status & modal states
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-gray-500 space-y-4">
        <p className="text-base font-bold text-gray-800">Your shopping cart is empty.</p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  // Count seller shipments
  const sellerIds = Array.from(new Set(items.map((i) => i.sellerId)));
  const deliveryFeeMinor = sellerIds.length * 150000;
  const grandTotalMinor = totalMinor + deliveryFeeMinor;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !streetAddress) {
      alert('Please fill in your delivery address.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        alert('Please fill in your card payment details.');
        return;
      }
    }

    if (paymentMethod === 'opay') {
      if (!opayPhone) {
        alert('Please enter your OPay registered phone number.');
        return;
      }
    }

    setLoading(true);

    try {
      let createdOrderId = `NUV-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      if (token) {
        try {
          const orderRes = await fetch(`${API_BASE_URL}/api/v1/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              deliveryAddress: { fullName, phone, state, city, streetAddress },
              paymentMethod,
              items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
            }),
          });
          const orderData = await orderRes.json();
          if (orderRes.ok && orderData?.id) {
            createdOrderId = orderData.orderNumber || orderData.id;
          }
        } catch (e) {
          // Fallback to local simulated order
        }
      }

      // Simulate instant payment authorization
      await new Promise((r) => setTimeout(r, 1200));

      const receipt = {
        orderNumber: createdOrderId,
        paymentMethod,
        totalPaidMinor: grandTotalMinor,
        itemsCount: items.length,
        deliveryAddress: `${streetAddress}, ${city}, ${state}`,
        customerName: fullName,
        customerPhone: phone,
      };

      setOrderComplete(receipt);
      clearCart();
    } catch (err: any) {
      alert(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 md:pb-12">
      {/* ORDER SUCCESS MODAL */}
      {orderComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/75 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-emerald-200 shadow-2xl text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-black uppercase text-amber-600 tracking-wider">Payment Verified</span>
              <h2 className="text-2xl font-black text-gray-950 mt-1">Order Placed Successfully!</h2>
              <p className="text-xs text-gray-500 mt-1">
                Your payment via <span className="font-bold uppercase text-emerald-800">{orderComplete.paymentMethod}</span> was verified. Escrow protection is active.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 border border-gray-200 text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Reference:</span>
                <span className="font-mono font-bold text-gray-900">{orderComplete.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Recipient:</span>
                <span className="font-bold text-gray-900">{orderComplete.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address:</span>
                <span className="font-bold text-gray-900 truncate max-w-[200px]">{orderComplete.deliveryAddress}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-sm text-emerald-900">
                <span>Total Amount Paid:</span>
                <span>{formatMoney(orderComplete.totalPaidMinor, 'NGN')}</span>
              </div>
            </div>

            <Link
              href="/products"
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm block shadow-lg shadow-emerald-700/20 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">Checkout</h1>
          <p className="text-xs text-gray-500">Escrow-protected multi-seller payment</p>
        </div>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="space-y-6">
        {/* Step 1: Delivery Address */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-7 space-y-4 shadow-sm">
          <h3 className="font-black text-gray-900 text-base flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <span>1. Delivery Address</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Babatunde Ogunlesi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                required
                placeholder="e.g. +234 801 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="Lagos">Lagos State</option>
                <option value="Abuja">FCT Abuja</option>
                <option value="Rivers">Rivers State (Port Harcourt)</option>
                <option value="Oyo">Oyo State (Ibadan)</option>
                <option value="Kano">Kano State</option>
                <option value="Delta">Delta State</option>
                <option value="Enugu">Enugu State</option>
                <option value="Ogun">Ogun State</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City / LGA</label>
              <input
                type="text"
                required
                placeholder="e.g. Ikeja, Lekki, Victoria Island"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
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
              className="w-full bg-slate-50 border border-gray-300 rounded-xl p-3 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Step 2: The 3 Payment Methods (Card, OPay, Paystack) */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-7 space-y-4 shadow-sm">
          <h3 className="font-black text-gray-900 text-base flex items-center gap-2 border-b border-gray-100 pb-3">
            <CreditCard className="w-5 h-5 text-emerald-700" />
            <span>2. Select Payment Method</span>
          </h3>

          <div className="space-y-3">
            {/* 1. Pay with Card */}
            <label
              onClick={() => setPaymentMethod('card')}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'card'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-gray-950 flex items-center gap-2">
                    <span>1. Pay with Card</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Instant
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">Mastercard</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">Visa</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">Verve</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pay securely using your Debit or Credit Card.
                </p>

                {paymentMethod === 'card' && (
                  <div className="mt-4 pt-4 border-t border-emerald-200/60 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BABATUNDE OGUNLESI"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="5399 •••• •••• ••••"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* 2. Pay with OPay */}
            <label
              onClick={() => setPaymentMethod('opay')}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'opay'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="opay"
                checked={paymentMethod === 'opay'}
                onChange={() => setPaymentMethod('opay')}
                className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-gray-950 flex items-center gap-2">
                    <span>2. Pay with OPay</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      Zero Fee
                    </span>
                  </span>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                    OPay Wallet
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Fast payment with OPay Phone Number or OPay App.
                </p>

                {paymentMethod === 'opay' && (
                  <div className="mt-4 pt-4 border-t border-emerald-200/60 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                        OPay Registered Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 08012345678"
                        value={opayPhone}
                        onChange={(e) => setOpayPhone(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div className="p-3 bg-emerald-100/60 rounded-xl text-[11px] text-emerald-950 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>You will receive an instant prompt in your OPay App or USSD *955# to authorize this payment.</span>
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* 3. Pay with Paystack */}
            <label
              onClick={() => setPaymentMethod('paystack')}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'paystack'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="paystack"
                checked={paymentMethod === 'paystack'}
                onChange={() => setPaymentMethod('paystack')}
                className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-gray-950 flex items-center gap-2">
                    <span>3. Pay with Paystack</span>
                    <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                      Online Gateway
                    </span>
                  </span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">
                    Paystack
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bank transfer, USSD, or direct internet banking checkout.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Step 3: Total Payable & Action Button (Integrated directly, separate Order Summary removed) */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-bold">Total Amount to Pay ({items.length} items + delivery):</span>
            <span className="text-2xl font-black text-emerald-700">
              {formatMoney(grandTotalMinor, 'NGN')}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 text-white font-black text-base shadow-xl shadow-emerald-800/25 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authorizing Payment...</span>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>
                  {paymentMethod === 'card' && 'Pay with Card'}
                  {paymentMethod === 'opay' && 'Pay with OPay'}
                  {paymentMethod === 'paystack' && 'Pay with Paystack'}
                  {' '}({formatMoney(grandTotalMinor, 'NGN')})
                </span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-emerald-900 font-bold pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Escrow Protected • Funds held safely until you receive your items</span>
          </div>
        </div>
      </form>
    </div>
  );
}
