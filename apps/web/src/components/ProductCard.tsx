'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Store, Check } from 'lucide-react';
import { formatMoney } from '@nuvora/shared';
import { useCart } from '@/context/CartContext';
import { CartIcon } from '@/components/CartIcon';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    basePriceMinor: number;
    compareAtPriceMinor?: number | null;
    images?: any;
    ratingAverage?: number;
    reviewCount?: number;
    seller?: {
      storeName: string;
      storeSlug: string;
    };
    variants?: any[];
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);

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

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const discountPercent = product.compareAtPriceMinor && product.compareAtPriceMinor > product.basePriceMinor
    ? Math.round(((product.compareAtPriceMinor - product.basePriceMinor) / product.compareAtPriceMinor) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-600/10 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-amber-500 text-emerald-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
          -{discountPercent}% OFF
        </span>
      )}

      {/* Image Preview with Link to Product Details */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full bg-slate-50 overflow-hidden block">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Product Details Content */}
      <div className="p-4 flex flex-col flex-1 bg-white">
        {/* Seller Info */}
        {product.seller && (
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mb-1">
            <Store className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{product.seller.storeName}</span>
          </div>
        )}

        <Link href={`/products/${product.slug}`} className="group-hover:text-emerald-700 transition-colors">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug mb-1.5">
            {product.title}
          </h3>
        </Link>

        {/* Rating Stars with Warm Gold Accent */}
        <div className="flex items-center gap-1 text-amber-500 text-xs mb-3">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-gray-800">{product.ratingAverage || '4.8'}</span>
          {product.reviewCount && (
            <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
          )}
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-base font-black text-gray-950 block">
              {formatMoney(product.basePriceMinor, 'NGN')}
            </span>
            {product.compareAtPriceMinor && product.compareAtPriceMinor > product.basePriceMinor && (
              <span className="text-xs text-gray-400 line-through">
                {formatMoney(product.compareAtPriceMinor, 'NGN')}
              </span>
            )}
          </div>

          {/* Add to Cart Button featuring the user's Cart Icon */}
          <button
            onClick={handleAddToCart}
            className={`p-2.5 rounded-xl text-white font-bold shadow-md transition-all active:scale-90 flex items-center justify-center ${
              addedAnimation
                ? 'bg-amber-500 scale-105'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/20'
            }`}
            title="Add to Cart"
          >
            {addedAnimation ? (
              <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
            ) : (
              <div className="w-4 h-4 text-white">
                <CartIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
