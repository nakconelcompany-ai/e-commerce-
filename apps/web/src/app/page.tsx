'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/ProductCard';
import { API_BASE_URL } from '@/lib/config';
import { allProducts } from '@/lib/productsData';
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Laptop,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Gamepad2,
  Tv,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>(allProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/products`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          // Merge API items with local rich catalog
          setProducts(data.items);
        }
      })
      .catch(() => {
        // Keep rich local products
      });
  }, []);

  return (
    <div className="space-y-8 sm:space-y-12 pb-16 sm:pb-20">
      {/* Hero Promotional Banner Section */}
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 border-b border-emerald-900 text-white relative overflow-hidden py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700 text-yellow-300 text-[11px] sm:text-xs font-black tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Marketplace • Emerald & Gold Edition</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
              Discover verified sellers.{' '}
              <span className="yellow-gradient-text block">Unbeatable Deals.</span>
            </h1>

            <p className="text-emerald-100/80 text-sm sm:text-lg max-w-xl leading-relaxed">
              Nigeria&apos;s premier multi-vendor shopping destination. Get authentic electronics, flagship smartphones, luxury wearables, and home appliances with escrow-protected payments and express delivery.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/products"
                className="w-full sm:w-auto text-center px-7 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Shop All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/seller"
                className="w-full sm:w-auto text-center px-7 py-3.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-sm border border-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Start Selling</span>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-square rounded-3xl overflow-hidden border-2 border-emerald-700/50 shadow-2xl shadow-emerald-950/40">
              <Image
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"
                alt="Marketplace Hero"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-4 rounded-2xl bg-emerald-950/85 backdrop-blur-md border border-emerald-700 text-white flex items-center justify-between gap-3 shadow-xl">
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs text-amber-400 font-extrabold block uppercase tracking-wider truncate">
                    Special Launch Offers
                  </span>
                  <span className="font-extrabold text-xs sm:text-sm truncate block text-white">
                    Up to ₦150,000 Off Select Electronics
                  </span>
                </div>
                <Link
                  href="/products"
                  className="text-xs bg-amber-400 hover:bg-amber-300 text-emerald-950 px-3.5 py-2 rounded-xl font-black shrink-0 transition-all"
                >
                  View Deals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg sm:text-2xl font-black text-gray-950 mb-4 sm:mb-6 flex items-center gap-2">
          <span>Popular Categories</span>
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {[
            { name: 'Phones & Tablets', slug: 'phones-tablets', icon: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { name: 'Laptops & PCs', slug: 'computers-laptops', icon: <Laptop className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { name: 'Smart Watches', slug: 'fashion-wearables', icon: <Shirt className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { name: 'Home Appliances', slug: 'home-kitchen', icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { name: 'OLED Smart TVs', slug: 'home-kitchen', icon: <Tv className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { name: 'Gaming Consoles', slug: 'computers-laptops', icon: <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" /> },
          ].map((cat) => (
            <Link
              key={cat.name}
              href={`/products?categoryId=${cat.slug}`}
              className="p-3 sm:p-5 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-600/10 transition-all text-center flex flex-col items-center gap-2 sm:gap-3 group active:scale-95"
            >
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                {cat.icon}
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-gray-900 line-clamp-1">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner with Emerald & Yellow Styling */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-xl border border-emerald-700">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-md shrink-0 border border-white/20">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase font-black text-amber-300">
                <Zap className="w-3.5 h-3.5" /> Live Flash Sale • Verified Sellers Only
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Daily Marketplace Mega Discounts</h3>
              <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5">
                Every purchase is protected with Nigerian escrow & instant verified refunds
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="w-full sm:w-auto text-center px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm shadow-lg shrink-0 transition-all"
          >
            Explore Flash Deals
          </Link>
        </div>
      </section>

      {/* Featured Products Grid with Custom Cart Icon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-gray-950">Featured Marketplace Products</h2>
            <p className="text-xs text-gray-500 hidden sm:block">Click any product to view full specifications, image gallery and related items</p>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Become a Seller Banner with Emerald Theme */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl border border-emerald-800 p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-xl">
          <div className="space-y-2 sm:space-y-3 max-w-xl text-center md:text-left">
            <span className="text-[11px] sm:text-xs font-black text-amber-400 tracking-wider uppercase">
              Expand Your Reach in Nigeria
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Open Your Verified Seller Store on Nuvora
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Sell to thousands of shoppers across all 36 States. Enjoy 5% capped commissions, weekly automatic payouts, your own custom store URL, and full inventory tracking.
            </p>
          </div>
          <Link
            href="/seller"
            className="w-full sm:w-auto text-center px-8 py-3.5 sm:py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm shadow-xl shadow-amber-400/20 active:scale-95 transition-all shrink-0"
          >
            Start Selling Today
          </Link>
        </div>
      </section>
    </div>
  );
}
