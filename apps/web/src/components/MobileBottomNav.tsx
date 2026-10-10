'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, LifeBuoy, User, Store } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export const MobileBottomNav = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Catalog', href: '/products', icon: Search },
    { label: 'Cart', href: '/cart', icon: ShoppingBag, badge: totalItems },
    { label: 'Support', href: '/support', icon: LifeBuoy },
    {
      label: user?.role === 'SELLER' ? 'Seller' : 'Account',
      href: user?.role === 'SELLER' ? '/seller' : '/account',
      icon: user?.role === 'SELLER' ? Store : User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-dark-900/95 backdrop-blur-lg border-t border-gray-800/80 px-2 py-1 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full py-1 text-[11px] font-bold transition-all ${
                isActive ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-500 text-dark-900 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-dark-900">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-amber-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
