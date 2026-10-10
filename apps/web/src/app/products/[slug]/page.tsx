'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@nuvora/shared';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/config';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Store,
  Star,
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  Plus,
  Minus,
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { user, token } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
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

  if (loading) return <div className="max-w-7xl mx-auto p-12 text-center text-gray-500">Loading product details...</div>;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link href="/products" className="text-brand-600 font-semibold underline">Return to catalog</Link>
      </div>
    );
  }

  const mainImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const priceMinor = selectedVariant ? selectedVariant.priceMinor : product.basePriceMinor;

  const handleAddToCart = () => {
    addItem({
      variantId: selectedVariant?.id || product.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: selectedVariant?.title || 'Standard',
      priceMinor,
      image: mainImage,
      quantity,
      sellerId: product.seller?.storeSlug || 'nuvora-official',
      sellerName: product.seller?.storeName || 'Nuvora Direct',
    });
    alert('Item added to shopping cart!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-brand-600">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 shadow-sm">
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <Image src={mainImage} alt={product.title} fill className="object-cover" priority />
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            {product.seller && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold mb-2 sm:mb-3">
                <Store className="w-3.5 h-3.5 text-brand-600" />
                <span>Seller: {product.seller.storeName}</span>
              </div>
            )}
            <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{product.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">SKU: {selectedVariant?.sku || product.sku}</span>
              <span>•</span>
              <div className="flex items-center text-amber-500 font-semibold">
                <Star className="w-4 h-4 fill-amber-400" /> {product.ratingAverage || '4.9'} ({product.reviewCount || reviews.length} reviews)
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-gray-500 uppercase font-bold block">Current Price</span>
              <span className="text-2xl sm:text-3xl font-black text-dark-900">{formatMoney(priceMinor, 'NGN')}</span>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100 text-gray-700 transition-colors"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 text-xs font-extrabold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-100 text-gray-700 transition-colors"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-b border-gray-100 py-4">
            <h4 className="font-bold text-gray-900 mb-1">Product Details</h4>
            <p>{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              className="py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-dark-900 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-brand-400" /> Add to Cart
            </button>
            <button
              onClick={() => { handleAddToCart(); router.push('/checkout'); }}
              className="py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-xs sm:text-sm shadow-lg active:scale-95 transition-all"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 shadow-sm">
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-brand-500" /> Verified Purchase Reviews ({reviews.length})
        </h3>

        {/* Post Review Form */}
        {token && (
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Write a Customer Review</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">Rating:</span>
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
            <div>
              <input
                type="text"
                required
                placeholder="Review Headline (e.g. Excellent Laptop performance)"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <textarea
                rows={3}
                required
                placeholder="Share your authentic experience with product quality, battery life, packaging..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-xs shadow-md"
            >
              {submittingReview ? 'Posting Review...' : 'Submit Verified Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="divide-y divide-gray-100 space-y-4 divide-y-0">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No customer reviews yet. Be the first to review!</div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <h5 className="font-bold text-gray-900 text-sm">{r.title}</h5>
                <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile - Instant Thumb Action */}
      <div className="fixed bottom-14 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Price</span>
          <span className="text-base font-black text-dark-900">{formatMoney(priceMinor * quantity, 'NGN')}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="px-3.5 py-2 rounded-xl bg-dark-900 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-brand-400" /> Cart
          </button>
          <button
            onClick={() => { handleAddToCart(); router.push('/checkout'); }}
            className="px-4 py-2 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-xs shadow-md"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
