'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatMoney } from '@nuvora/shared';
import { CartIcon } from '@/components/CartIcon';
import {
  X,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Move,
  CreditCard,
  CheckCircle,
} from 'lucide-react';

export const FloatingDraggableCart = () => {
  const router = useRouter();
  const { items, totalItems, totalMinor, updateQuantity, removeItem } = useCart();

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [justAddedBounce, setJustAddedBounce] = useState(false);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; moved: boolean }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    moved: false,
  });

  const buttonRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(totalItems);

  // Initialize position in the bottom-right corner once mounted on client
  useEffect(() => {
    const handleInitialPos = () => {
      const padding = 24;
      const btnSize = 64;
      const initialX = Math.max(16, window.innerWidth - btnSize - padding);
      const initialY = Math.max(16, window.innerHeight - btnSize - padding - 40);
      setPosition({ x: initialX, y: initialY });
    };

    handleInitialPos();
    window.addEventListener('resize', handleInitialPos);
    return () => window.removeEventListener('resize', handleInitialPos);
  }, []);

  // Animate button when total items change
  useEffect(() => {
    if (totalItems > prevCountRef.current) {
      setJustAddedBounce(true);
      const t = setTimeout(() => setJustAddedBounce(false), 900);
      return () => clearTimeout(t);
    }
    prevCountRef.current = totalItems;
  }, [totalItems]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!position) return;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
      moved: false,
    };
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.mouseX;
      const dy = moveEvent.clientY - dragStartRef.current.mouseY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragStartRef.current.moved = true;
      }

      const newX = Math.max(12, Math.min(window.innerWidth - 76, dragStartRef.current.startX + dx));
      const newY = Math.max(12, Math.min(window.innerHeight - 76, dragStartRef.current.startY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!position || e.touches.length === 0) return;
    const touch = e.touches[0];
    dragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      startX: position.x,
      startY: position.y,
      moved: false,
    };
    setIsDragging(true);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const t = moveEvent.touches[0];
      const dx = t.clientX - dragStartRef.current.mouseX;
      const dy = t.clientY - dragStartRef.current.mouseY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragStartRef.current.moved = true;
      }

      const newX = Math.max(12, Math.min(window.innerWidth - 76, dragStartRef.current.startX + dx));
      const newY = Math.max(12, Math.min(window.innerHeight - 76, dragStartRef.current.startY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleButtonClick = () => {
    // If the user was just dragging, don't open the drawer
    if (dragStartRef.current.moved) return;
    setIsDrawerOpen((prev) => !prev);
  };

  if (!position) return null;

  return (
    <>
      {/* Floating Draggable Cart Button */}
      <div
        ref={buttonRef}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          touchAction: 'none',
        }}
        className={`fixed top-0 left-0 z-50 select-none transition-shadow ${
          isDragging ? 'cursor-grabbing scale-105 shadow-2xl' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="relative group">
          <button
            onClick={handleButtonClick}
            type="button"
            aria-label="View Shopping Cart"
            className={`w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-950/50 border-2 border-white ring-4 ring-emerald-500/30 active:scale-95 transition-transform ${
              justAddedBounce ? 'animate-bounce' : ''
            }`}
          >
            {/* User's Exact Cart Icon (Transparent Background) */}
            <div className="relative w-10 h-10 flex items-center justify-center pointer-events-none">
              <Image
                src="/cart-icon.png"
                alt="Shopping Cart"
                width={40}
                height={40}
                className="object-contain drop-shadow"
                priority
              />
            </div>

            {/* Item Count Badge in Vibrant Yellow / Gold */}
            <span className="absolute -top-1 -right-1 bg-amber-400 text-emerald-950 font-black text-xs min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center shadow-lg border-2 border-white pointer-events-none">
              {totalItems}
            </span>
          </button>

          {/* Drag Grip / Hint Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center gap-1 bg-emerald-950 text-white text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-xl border border-emerald-700 pointer-events-none">
            <Move className="w-2.5 h-2.5 text-amber-400" />
            <span>Drag anywhere or click</span>
          </div>
        </div>
      </div>

      {/* Slide-out Cart Flyout Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-emerald-100">
              {/* Drawer Header */}
              <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 px-6 py-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center p-1.5 border border-white/20">
                    <Image src="/cart-icon.png" alt="Cart" width={28} height={28} className="object-contain" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight text-white">Your Shopping Cart</h3>
                    <p className="text-xs text-emerald-100 font-medium">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'} in basket
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-4">
                      <Image src="/cart-icon.png" alt="Cart" width={56} height={56} className="object-contain opacity-40 invert brightness-0" />
                    </div>
                    <h4 className="text-base font-extrabold text-gray-900">Your cart is currently empty</h4>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Discover verified products from top sellers across Nigeria and add them to your cart.
                    </p>
                    <Link
                      href="/products"
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.variantId} className="py-4 flex gap-4 items-center">
                        <div className="relative w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                          <Image src={item.image} alt={item.productTitle} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.productTitle}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">{item.variantTitle}</p>
                          <span className="text-xs font-black text-emerald-700 block mt-1">
                            {formatMoney(item.priceMinor, 'NGN')}
                          </span>

                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 text-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 py-0.5 text-xs font-bold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 text-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-gray-900">
                            {formatMoney(item.priceMinor * item.quantity, 'NGN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer with Checkout */}
              {items.length > 0 && (
                <div className="bg-slate-50 border-t border-gray-200 p-6 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-extrabold text-gray-900">{formatMoney(totalMinor, 'NGN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>Delivery calculated at checkout</span>
                      <span className="text-emerald-700 font-semibold">Fast Shipping</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-extrabold text-gray-900">
                      <span>Total</span>
                      <span className="text-base text-emerald-700 font-black">
                        {formatMoney(totalMinor, 'NGN')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      href="/cart"
                      onClick={() => setIsDrawerOpen(false)}
                      className="py-3 px-4 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-extrabold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Full Cart</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        router.push('/checkout');
                      }}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white font-extrabold text-xs text-center shadow-lg shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                      <span>Checkout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
