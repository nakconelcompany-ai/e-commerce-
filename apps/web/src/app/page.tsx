'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/ProductCard';
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
  ShoppingCart,
  CheckCircle,
} from 'lucide-react';

const sampleProducts = [
  {
    id: 'prod-1',
    title: 'UltraBook Pro 15 M3 16GB / 512GB SSD',
    slug: 'ultrabook-pro-15-m3',
    basePriceMinor: 145000000,
    compareAtPriceMinor: 160000000,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
    ratingAverage: 4.9,
    seller: { storeName: 'Apex Tech Hub', storeSlug: 'apex-tech-hub' },
  },
  {
    id: 'prod-2',
    title: 'Nuvora Nova 5G Smartphone 256GB Gold',
    slug: 'nuvora-nova-5g-smartphone',
    basePriceMinor: 48000000,
    compareAtPriceMinor: 52000000,
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'],
    ratingAverage: 4.8,
    seller: { storeName: 'Apex Tech Hub', storeSlug: 'apex-tech-hub' },
  },
  {
    id: 'prod-3',
    title: 'Noise Cancelling Wireless Headphones ANC',
    slug: 'noise-cancelling-wireless-headphones-anc',
    basePriceMinor: 12500000,
    compareAtPriceMinor: 14000000,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    ratingAverage: 4.7,
    seller: { storeName: 'Apex Tech Hub', storeSlug: 'apex-tech-hub' },
  },
  {
    id: 'prod-4',
    title: 'Smart OLED Series 9 4K HDR 55-Inch TV',
    slug: 'smart-oled-series-9-4k-hdr-55-inch-tv',
    basePriceMinor: 78000000,
    compareAtPriceMinor: 85000000,
    images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80'],
    ratingAverage: 4.9,
    seller: { storeName: 'Apex Tech Hub', storeSlug: 'apex-tech-hub' },
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/products')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          setProducts(data.items);
        } else {
          setProducts(sampleProducts);
        }
      })
      .catch(() => setProducts(sampleProducts))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 sm:space-y-12 pb-12 sm:pb-16">
      {/* Hero Promotional Banner Section */}
      <section className="bg-dark-900 border-b border-gray-800 text-white relative overflow-hidden py-8 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-amber-400 text-[11px] sm:text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Official Launch • Nuvora Marketplace
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
              Discover verified sellers. <span className="gold-gradient-text block">Unbeatable Deals.</span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-lg max-w-xl leading-relaxed">
              Nigeria&apos;s premier multi-vendor shopping destination. Get authentic electronics, smartphones, fashion, and home goods with escrow protected payment and express delivery.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/products"
                className="w-full sm:w-auto text-center px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-dark-900 font-extrabold text-sm shadow-xl shadow-brand-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Shop All Categories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/seller"
                className="w-full sm:w-auto text-center px-6 py-3.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-white font-bold text-sm border border-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Start Selling</span>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border border-brand-500/20 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"
                alt="Marketplace Banner"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl dark-glass border border-gray-700 text-white flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs text-brand-400 font-bold block uppercase truncate">Flash Sale Highlight</span>
                  <span className="font-bold text-xs sm:text-sm truncate block">Laptops & 5G Phones up to 25% Off</span>
                </div>
                <Link href="/products" className="text-xs bg-brand-500 text-dark-900 px-3 py-1.5 rounded-lg font-bold shrink-0">
                  View Deals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Slider - 3 cols on mobile, 6 cols on tablet/desktop */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
          <span>Explore Top Categories</span>
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4">
          {[
            { name: 'Phones & Tablets', slug: 'phones-tablets', icon: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { name: 'Computers & Laptops', slug: 'computers-laptops', icon: <Laptop className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { name: 'Fashion & Wearables', slug: 'fashion-wearables', icon: <Shirt className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { name: 'Home & Kitchen', slug: 'home-kitchen', icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { name: 'Beauty & Care', slug: 'beauty-personal-care', icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { name: 'Groceries', slug: 'groceries-essentials', icon: <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" /> },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?categoryId=${cat.slug}`}
              className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:border-brand-500 hover:shadow-lg transition-all text-center flex flex-col items-center gap-1.5 sm:gap-3 group active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 group-hover:bg-brand-500 group-hover:text-dark-900 text-brand-600 flex items-center justify-center transition-colors">
                {cat.icon}
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-800 line-clamp-1">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-brand-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-md shrink-0">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase font-extrabold text-yellow-300">
                <Zap className="w-3.5 h-3.5" /> Live Flash Sale • Limited Stock
              </div>
              <h3 className="text-xl sm:text-2xl font-black">Daily Mega Deals & Discounts</h3>
              <p className="text-[11px] sm:text-xs text-amber-100 mt-0.5">Verified seller inventory updated every 6 hours</p>
            </div>
          </div>
          <Link
            href="/products"
            className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-dark-900 text-white font-bold text-xs sm:text-sm hover:bg-dark-800 transition-colors shadow-lg shrink-0"
          >
            Explore Flash Deals
          </Link>
        </div>
      </section>

      {/* Featured Products Grid - 2 cols on mobile for native app feel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Featured Marketplace Products</h2>
            <p className="text-xs text-gray-500 hidden sm:block">Top rated and fast-shipping items from verified stores</p>
          </div>
          <Link href="/products" className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 sm:h-80 rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Become a Seller Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark-900 rounded-2xl sm:rounded-3xl border border-brand-500/30 p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2 sm:space-y-4 max-w-xl text-center md:text-left">
            <span className="text-[11px] sm:text-xs font-extrabold text-amber-400 tracking-wider uppercase">Grow Your Business</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold gold-gradient-text">Open Your Verified Seller Store on Nuvora</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Reach thousands of eager shoppers across Nigeria. Enjoy low commission rates, automated weekly payouts, custom store URLs, and real-time inventory management.
            </p>
          </div>
          <Link
            href="/seller"
            className="w-full sm:w-auto text-center px-8 py-3.5 sm:py-4 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-sm shadow-xl active:scale-95 transition-all shrink-0"
          >
            Start Selling Today
          </Link>
        </div>
      </section>
    </div>
  );
}
