import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, CreditCard, Headphones } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-dark-900 text-gray-400 text-sm border-t border-gray-800">
      {/* Value Proposition Highlights */}
      <div className="border-b border-gray-800 bg-dark-800/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800 border border-gray-800">
            <ShieldCheck className="w-10 h-10 text-brand-400 shrink-0" />
            <div>
              <h4 className="text-white font-semibold">100% Verified Sellers</h4>
              <p className="text-xs text-gray-400">Escrow protected buyer payment guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800 border border-gray-800">
            <Truck className="w-10 h-10 text-brand-400 shrink-0" />
            <div>
              <h4 className="text-white font-semibold">Fast Nationwide Shipping</h4>
              <p className="text-xs text-gray-400">Tracked deliveries across all 36 States</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800 border border-gray-800">
            <CreditCard className="w-10 h-10 text-brand-400 shrink-0" />
            <div>
              <h4 className="text-white font-semibold">Secure Online Payment</h4>
              <p className="text-xs text-gray-400">Paystack Bank Transfer, Cards & USSD</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800 border border-gray-800">
            <Headphones className="w-10 h-10 text-brand-400 shrink-0" />
            <div>
              <h4 className="text-white font-semibold">24/7 Buyer Support</h4>
              <p className="text-xs text-gray-400">Dedicated help desk & return resolution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-brand-500/40">
              <Image src="/logo.png" alt="Nuvora Logo" fill className="object-cover" />
            </div>
            <span className="text-xl font-extrabold gold-gradient-text">NUVORA</span>
          </div>
          <p className="text-xs leading-relaxed text-gray-400">
            Nigeria&apos;s premium multi-vendor e-commerce marketplace connecting verified sellers directly with millions of smart buyers nationwide.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Marketplace Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products?categoryId=phones-tablets" className="hover:text-brand-400 transition-colors">Phones & Tablets</Link></li>
            <li><Link href="/products?categoryId=computers-laptops" className="hover:text-brand-400 transition-colors">Computers & Laptops</Link></li>
            <li><Link href="/products?categoryId=fashion-wearables" className="hover:text-brand-400 transition-colors">Fashion & Accessories</Link></li>
            <li><Link href="/products?categoryId=home-kitchen" className="hover:text-brand-400 transition-colors">Home & Kitchen Appliances</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Seller Portal</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/seller" className="text-amber-400 hover:underline">Register as a Seller</Link></li>
            <li><Link href="/seller" className="hover:text-brand-400 transition-colors">Seller Dashboard & Payouts</Link></li>
            <li><Link href="/seller" className="hover:text-brand-400 transition-colors">Commission Rates & Policy</Link></li>
            <li><Link href="/seller" className="hover:text-brand-400 transition-colors">Fulfillment & Shipping Guide</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Contact & Support</h4>
          <p className="text-xs mb-2">Email: support@nuvora.ng</p>
          <p className="text-xs mb-2">Phone: +234 (0) 800 NUVORA</p>
          <p className="text-xs text-gray-400">Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} NUVORA Marketplace Ltd. All rights reserved. Built with Next.js & NestJS.
      </div>
    </footer>
  );
};
