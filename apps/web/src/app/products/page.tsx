'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('categoryId') || '';

  const [q, setQ] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCat);
  const [sort, setSort] = useState('recency');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('categoryId', categoryId);
    if (sort) params.set('sort', sort);

    fetch(`${API_BASE_URL}/api/v1/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items) {
          setProducts(data.items);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, categoryId, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Search Header Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Search catalog by title, brand, or SKU..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-slate-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex items-center">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="phones-tablets">Phones & Tablets</option>
            <option value="computers-laptops">Computers & Laptops</option>
            <option value="fashion-wearables">Fashion & Wearables</option>
            <option value="home-kitchen">Home & Kitchen</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none"
          >
            <option value="recency">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid - 2 cols on mobile */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 sm:h-80 rounded-2xl skeleton" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No products found</h3>
          <p className="text-xs text-gray-500">Try refining your search terms or category filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
