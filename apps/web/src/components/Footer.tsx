import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, Headphones } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-emerald-950 text-emerald-100/70 text-sm border-t border-emerald-900">
      {/* Value Proposition Highlights */}
      <div className="border-b border-emerald-900/80 bg-emerald-900/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-900/50 border border-emerald-800">
            <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold">100% Verified Sellers</h4>
              <p className="text-xs text-emerald-200/70">Escrow protected buyer payment guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-900/50 border border-emerald-800">
            <Truck className="w-10 h-10 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold">Fast Nationwide Shipping</h4>
              <p className="text-xs text-emerald-200/70">Tracked deliveries across all 36 States</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-900/50 border border-emerald-800">
            <CreditCard className="w-10 h-10 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold">Secure Online Payment</h4>
              <p className="text-xs text-emerald-200/70">Card, OPay & Paystack Direct</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-900/50 border border-emerald-800">
            <Headphones className="w-10 h-10 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold">24/7 Buyer Support</h4>
              <p className="text-xs text-emerald-200/70">Dedicated help desk & return resolution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          {/* Typographic Brand Wordmark (Logo image removed) */}
          <div className="mb-4">
            <span className="text-2xl font-black text-white flex items-center tracking-tight">
              NUVORA<span className="text-amber-400">.</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase font-bold text-emerald-400 block -mt-1">
              MARKETPLACE
            </span>
          </div>
          <p className="text-xs leading-relaxed text-emerald-200/80">
            Nigeria&apos;s premier multi-vendor e-commerce marketplace connecting verified sellers directly with millions of smart buyers nationwide.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase">Marketplace Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products?categoryId=phones-tablets" className="hover:text-amber-300 transition-colors">Phones & Tablets</Link></li>
            <li><Link href="/products?categoryId=computers-laptops" className="hover:text-amber-300 transition-colors">Computers & Laptops</Link></li>
            <li><Link href="/products?categoryId=fashion-wearables" className="hover:text-amber-300 transition-colors">Fashion & Accessories</Link></li>
            <li><Link href="/products?categoryId=home-kitchen" className="hover:text-amber-300 transition-colors">Home & Kitchen Appliances</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase">Seller Portal</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/seller" className="text-amber-300 hover:text-amber-200 font-bold hover:underline">Register as a Seller</Link></li>
            <li><Link href="/seller" className="hover:text-amber-300 transition-colors">Seller Dashboard & Payouts</Link></li>
            <li><Link href="/seller" className="hover:text-amber-300 transition-colors">Commission Rates & Policy</Link></li>
            <li><Link href="/seller" className="hover:text-amber-300 transition-colors">Fulfillment & Shipping Guide</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase">Payment & Support</h4>
          <p className="text-xs mb-2">Accepted: Card, OPay, Paystack</p>
          <p className="text-xs mb-2">Email: support@nuvora.ng</p>
          <p className="text-xs mb-2">Phone: +234 (0) 800 NUVORA</p>
          <p className="text-xs text-emerald-300/70">Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>

      <div className="border-t border-emerald-900/80 py-6 text-center text-xs text-emerald-300/60">
        © {new Date().getFullYear()} NUVORA Marketplace Ltd. All rights reserved. Emerald & Gold Luxury Edition.
      </div>
    </footer>
  );
};
