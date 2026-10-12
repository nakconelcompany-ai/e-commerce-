'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Search } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';
import { allProducts } from '@/lib/productsData';

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('categoryId') || '';

  const [q, setQ] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCat);
  const [sort, setSort] = useState('recency');
  const [apiProducts, setApiProducts] = useState<any[]>([]);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCategoryId(initialCat);
  }, [initialCat]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('categoryId', categoryId);
    if (sort) params.set('sort', sort);

    fetch(`${API_BASE_URL}/api/v1/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          setApiProducts(data.items);
        }
      })
      .catch(() => {});
  }, [q, categoryId, sort]);

  // Combine and filter products
  const filteredProducts = useMemo(() => {
    let list = apiProducts.length > 0 ? apiProducts : allProducts;

    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.brand?.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    if (categoryId) {
      list = list.filter((p) => p.categorySlug === categoryId || p.category?.toLowerCase().includes(categoryId.replace('-', ' ')));
    }

    // Sort
    const sorted = [...list];
    if (sort === 'price_asc') {
      sorted.sort((a, b) => a.basePriceMinor - b.basePriceMinor);
    } else if (sort === 'price_desc') {
      sorted.sort((a, b) => b.basePriceMinor - a.basePriceMinor);
    } else if (sort === 'popularity') {
      sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return sorted;
  }, [apiProducts, q, categoryId, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12">
      {/* Search Header Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Search catalog by title, brand, or SKU..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-slate-50 border border-gray-300 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
          />
          <Search className="w-4 h-4 text-emerald-700 absolute left-4 top-4" />
        </div>

        <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex items-center">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-gray-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-800 font-bold focus:outline-none focus:border-emerald-600"
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
            className="w-full md:w-auto bg-slate-50 border border-gray-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-800 font-bold focus:outline-none focus:border-emerald-600"
          >
            <option value="recency">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-emerald-100 shadow-sm space-y-3">
          <Search className="w-12 h-12 text-emerald-300 mx-auto" />
          <h3 className="text-lg font-black text-gray-900">No products matched your search</h3>
          <p className="text-xs text-gray-500">Try adjusting your filters or search keywords</p>
          <button
            onClick={() => {
              setQ('');
              setCategoryId('');
            }}
            className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-emerald-800 font-bold">Loading catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
