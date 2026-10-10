'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatMoney } from '@nuvora/shared';
import { Trash2, ArrowRight, ShoppingBag, Store, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalMinor } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center space-y-4">
        <div className="w-16 sm:w-20 h-16 sm:h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-brand-600">
          <ShoppingBag className="w-8 sm:w-10 h-8 sm:h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Your shopping cart is empty</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
          Explore thousands of verified products from top sellers across Nigeria.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-dark-900 font-extrabold text-xs sm:text-sm shadow-md"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-20 md:pb-8">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {Object.entries(itemsBySeller).map(([sellerId, group]) => (
            <div key={sellerId} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-2 text-xs font-bold text-gray-700">
                <Store className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="truncate">Fulfilled by: {group.name}</span>
              </div>

              <div className="divide-y divide-gray-100 p-4 sm:p-6 space-y-3 divide-y-0">
                {group.items.map((item) => (
                  <div key={item.variantId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        <Image src={item.image || '/logo.png'} alt={item.productTitle} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1">{item.productTitle}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{item.variantTitle}</p>
                        <span className="text-sm font-extrabold text-dark-900 block mt-1">
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
                        <span className="px-3 py-1 text-xs font-extrabold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2.5 py-1 text-gray-600 font-bold hover:bg-gray-100 text-xs"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-xs sm:text-sm text-gray-900 min-w-[70px] text-right">
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

          <div className="flex justify-between items-center text-xs font-semibold px-1">
            <button onClick={clearCart} className="text-red-600 hover:underline">
              Clear Cart
            </button>
            <Link href="/products" className="text-brand-600 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4 sm:space-y-6 shadow-sm">
          <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-3">Order Summary</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({items.length} items)</span>
              <span className="font-semibold text-gray-900">{formatMoney(totalMinor, 'NGN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Delivery ({Object.keys(itemsBySeller).length} shipments)</span>
              <span className="font-semibold text-gray-900">{formatMoney(Object.keys(itemsBySeller).length * 150000, 'NGN')}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-extrabold text-dark-900">
              <span>Grand Total</span>
              <span className="text-lg gold-gradient-text">
                {formatMoney(totalMinor + Object.keys(itemsBySeller).length * 150000, 'NGN')}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full block text-center py-3.5 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-sm shadow-lg active:scale-95 transition-all"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
