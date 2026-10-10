'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star, Store } from 'lucide-react';
import { formatMoney } from '@nuvora/shared';
import { useCart } from '@/context/CartContext';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    basePriceMinor: number;
    compareAtPriceMinor?: number | null;
    images?: any;
    ratingAverage?: number;
    seller?: {
      storeName: string;
      storeSlug: string;
    };
    variants?: any[];
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

  const defaultVariant = product.variants && product.variants.length > 0
    ? product.variants[0]
    : { id: product.id, title: 'Standard', priceMinor: product.basePriceMinor };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      variantId: defaultVariant.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: defaultVariant.title,
      priceMinor: defaultVariant.priceMinor || product.basePriceMinor,
      image: imageUrl,
      quantity: 1,
      sellerId: product.seller?.storeSlug || 'nuvora-official',
      sellerName: product.seller?.storeName || 'Nuvora Direct',
    });
  };

  const discountPercent = product.compareAtPriceMinor && product.compareAtPriceMinor > product.basePriceMinor
    ? Math.round(((product.compareAtPriceMinor - product.basePriceMinor) / product.compareAtPriceMinor) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md">
          -{discountPercent}% OFF
        </span>
      )}

      {/* Image Preview */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Product Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Seller Info */}
        {product.seller && (
          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium mb-1">
            <Store className="w-3 h-3 text-brand-600" />
            <span className="truncate">{product.seller.storeName}</span>
          </div>
        )}

        <Link href={`/products/${product.slug}`} className="group-hover:text-brand-600 transition-colors">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 text-amber-500 text-xs mb-3">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span className="font-semibold text-gray-700">{product.ratingAverage || '4.8'}</span>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-auto flex items-end justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-base font-extrabold text-dark-900 block">
              {formatMoney(product.basePriceMinor, 'NGN')}
            </span>
            {product.compareAtPriceMinor && product.compareAtPriceMinor > product.basePriceMinor && (
              <span className="text-xs text-gray-400 line-through">
                {formatMoney(product.compareAtPriceMinor, 'NGN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-dark-900 font-bold shadow-md shadow-brand-500/20 active:scale-95 transition-all"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
