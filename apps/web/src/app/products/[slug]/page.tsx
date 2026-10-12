'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@nuvora/shared';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/config';
import { getProductBySlug, getRelatedProducts, ProductItem } from '@/lib/productsData';
import { ProductCard } from '@/components/ProductCard';
import { CartIcon } from '@/components/CartIcon';
import {
  ShieldCheck,
  Truck,
  Store,
  Star,
  ArrowLeft,
  MessageSquare,
  Plus,
  Minus,
  Check,
  Zap,
  Sparkles,
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { user, token } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(false);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // 1. First check local catalog for instant instant load & guaranteed data
    const localProduct = getProductBySlug(params.slug);
    if (localProduct) {
      setProduct(localProduct);
      setLoading(false);
    }

    // 2. Also try API if running
    fetch(`${API_BASE_URL}/api/v1/products/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
          fetchReviews(data.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  const fetchReviews = (productId: string) => {
    fetch(`${API_BASE_URL}/api/v1/reviews/product/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(() => {});
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please sign in to post a review.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit review');
      alert('Thank you! Your verified review has been posted.');
      setReviewTitle('');
      setReviewComment('');
      fetchReviews(product.id);
    } catch (err: any) {
      alert(err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-emerald-800 font-bold">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <Link href="/products" className="text-emerald-700 font-bold underline">
          Return to catalog
        </Link>
      </div>
    );
  }

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];

  const currentImage = imagesList[selectedImageIndex] || imagesList[0];
  const priceMinor = selectedVariant ? selectedVariant.priceMinor : product.basePriceMinor;

  const handleAddToCart = () => {
    addItem({
      variantId: selectedVariant?.id || product.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: selectedVariant?.title || 'Standard',
      priceMinor,
      image: currentImage,
      quantity,
      sellerId: product.seller?.storeSlug || 'nuvora-official',
      sellerName: product.seller?.storeName || 'Nuvora Direct',
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const relatedProducts = getRelatedProducts(product.slug, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12 pb-28 md:pb-12">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-24 right-4 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <span className="font-extrabold text-sm block">Added to Cart!</span>
            <span className="text-xs text-emerald-200">
              {quantity}x {product.title.substring(0, 32)}...
            </span>
          </div>
        </div>
      )}

      {/* Back to Catalog Breadcrumb */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
      </Link>

      {/* Main Product Showcase Box */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-4 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 shadow-xl shadow-emerald-950/5">
        {/* Left: Product Images & Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-gray-200 shadow-sm">
            <Image
              src={currentImage}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
            {product.compareAtPriceMinor && product.compareAtPriceMinor > priceMinor && (
              <span className="absolute top-4 left-4 bg-amber-500 text-emerald-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                SAVE {formatMoney(product.compareAtPriceMinor - priceMinor, 'NGN')}
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imagesList.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-400/40'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`${product.title} - ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Verified Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>100% Authentic Product</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Truck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Fast Tracked Delivery</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details, Price, and Actions */}
        <div className="space-y-6">
          <div>
            {product.seller && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/70 text-emerald-900 border border-emerald-300 text-xs font-bold mb-3">
                <Store className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Seller: {product.seller.storeName}</span>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                SKU: {selectedVariant?.sku || product.sku}
              </span>
              <span>•</span>
              <div className="flex items-center text-amber-500 font-bold gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.ratingAverage || '4.9'}</span>
                <span className="text-gray-400">({product.reviewCount || reviews.length} verified ratings)</span>
              </div>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/40 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-800 font-extrabold uppercase block tracking-wider">
                Price
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-emerald-950">
                  {formatMoney(priceMinor, 'NGN')}
                </span>
                {product.compareAtPriceMinor && product.compareAtPriceMinor > priceMinor && (
                  <span className="text-sm sm:text-base text-gray-400 line-through font-semibold">
                    {formatMoney(product.compareAtPriceMinor, 'NGN')}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center border-2 border-emerald-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 hover:bg-emerald-50 text-emerald-950 transition-colors"
                title="Decrease"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-1 text-sm font-black text-emerald-950">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2.5 hover:bg-emerald-50 text-emerald-950 transition-colors"
                title="Increase"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2">
            <h4 className="font-extrabold text-gray-950 uppercase tracking-wide text-xs">
              Product Overview
            </h4>
            <p>{product.description}</p>
          </div>

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <h4 className="font-extrabold text-gray-950 uppercase tracking-wide text-xs">
                Key Specifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(product.specifications).map(([key, val]: any) => (
                  <div key={key} className="p-2.5 rounded-xl bg-slate-50 border border-gray-200">
                    <span className="font-bold text-gray-500 block text-[10px] uppercase">{key}</span>
                    <span className="font-bold text-gray-900">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons with the User's Cart Icon */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              className="py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-700/20 active:scale-95 transition-all"
            >
              <div className="w-5 h-5 text-white">
                <CartIcon className="w-5 h-5 text-white" />
              </div>
              <span>Add to Cart</span>
            </button>

            <button
              onClick={() => {
                handleAddToCart();
                router.push('/checkout');
              }}
              className="py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-emerald-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-emerald-950" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS SECTION */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950">Related Products</h3>
              <p className="text-xs text-gray-500">Frequently bought together with this product</p>
            </div>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All</span>
          </Link>
        </div>

        {/* 4 Related Product Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.map((relProduct) => (
            <ProductCard key={relProduct.id} product={relProduct} />
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-10 space-y-6 shadow-sm">
        <h3 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-700" />
          <span>Verified Customer Reviews</span>
        </h3>

        {/* Post Review Form */}
        {token && (
          <form onSubmit={handleReviewSubmit} className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 sm:p-6 space-y-4">
            <h4 className="font-extrabold text-emerald-950 text-sm">Write a Customer Review</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`p-1 ${star <= reviewRating ? 'text-amber-400' : 'text-gray-300'}`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              placeholder="Headline (e.g. Blazing speed and stunning display)"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
            />
            <textarea
              rows={3}
              required
              placeholder="Tell others about product performance, build quality, shipping speed..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md"
            >
              {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
            </button>
          </form>
        )}

        {/* Existing Reviews */}
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-gray-400">Verified Buyer</span>
            </div>
            <h5 className="font-bold text-gray-900 text-sm">Outstanding quality and super fast delivery!</h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              Arrived within 24 hours in Lagos. Authentic sealed package with full warranty. Highly recommended!
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-bold block">Total</span>
          <span className="text-base font-black text-emerald-950">
            {formatMoney(priceMinor * quantity, 'NGN')}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <div className="w-4 h-4 text-white">
              <CartIcon className="w-4 h-4 text-white" />
            </div>
            <span>Cart</span>
          </button>
          <button
            onClick={() => {
              handleAddToCart();
              router.push('/checkout');
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-400 text-emerald-950 font-black text-xs shadow-md"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
