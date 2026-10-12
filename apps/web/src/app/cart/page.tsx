'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatMoney } from '@nuvora/shared';
import { Trash2, ArrowRight, Store, Plus, Minus, CreditCard } from 'lucide-react';
import { CartIcon } from '@/components/CartIcon';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalMinor } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto text-emerald-800 p-4 border border-emerald-200 shadow-md">
          <CartIcon className="w-10 h-10 text-emerald-800" />
        </div>
        <h2 className="text-2xl font-black text-gray-950">Your shopping cart is empty</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
          Explore thousands of verified products from top sellers across Nigeria.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-xl shadow-emerald-700/20 transition-all"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Group items by seller for multi-seller breakdown display
  const itemsBySeller = items.reduce((acc, item) => {
    if (!acc[item.sellerId]) acc[item.sellerId] = { name: item.sellerName, items: [] };
    acc[item.sellerId].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; items: typeof items }>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12">
      <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-gray-500">Fulfilled by verified merchants across Nigeria</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:underline font-bold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {Object.entries(itemsBySeller).map(([sellerId, group]) => (
            <div key={sellerId} className="bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-sm">
              <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 sm:px-6 py-3 flex items-center gap-2 text-xs font-bold text-emerald-950">
                <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="truncate">Fulfilled by: {group.name}</span>
              </div>

              <div className="divide-y divide-gray-100 p-4 sm:p-6 space-y-3 divide-y-0">
                {group.items.map((item) => (
                  <div key={item.variantId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        <Image src={item.image} alt={item.productTitle} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-950 text-xs sm:text-sm line-clamp-1">{item.productTitle}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{item.variantTitle}</p>
                        <span className="text-sm font-black text-emerald-800 block mt-1">
                          {formatMoney(item.priceMinor, 'NGN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2.5 py-1 text-gray-600 font-bold hover:bg-gray-100 text-xs"
                          title="Reduce"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-black text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2.5 py-1 text-gray-600 font-bold hover:bg-gray-100 text-xs"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-black text-xs sm:text-sm text-gray-950 min-w-[80px] text-right">
                        {formatMoney(item.priceMinor * item.quantity, 'NGN')}
                      </span>

                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center text-xs font-bold px-1">
            <Link href="/products" className="text-emerald-700 hover:underline">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-6 space-y-6 shadow-sm sticky top-28">
          <h3 className="font-black text-gray-950 text-base border-b border-gray-100 pb-3">Order Summary</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({items.length} items)</span>
              <span className="font-bold text-gray-950">{formatMoney(totalMinor, 'NGN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Delivery ({Object.keys(itemsBySeller).length} shipments)</span>
              <span className="font-bold text-gray-950">{formatMoney(Object.keys(itemsBySeller).length * 150000, 'NGN')}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-black text-emerald-950">
              <span>Grand Total</span>
              <span className="text-xl font-black text-emerald-700">
                {formatMoney(totalMinor + Object.keys(itemsBySeller).length * 150000, 'NGN')}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full block text-center py-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-800/20 active:scale-95 transition-all"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
