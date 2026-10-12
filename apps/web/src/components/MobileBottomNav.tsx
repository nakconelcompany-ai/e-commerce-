'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, LifeBuoy, User, Store } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CartIcon } from '@/components/CartIcon';

export const MobileBottomNav = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Catalog', href: '/products', icon: Search },
    { label: 'Cart', href: '/cart', isCart: true, badge: totalItems },
    { label: 'Support', href: '/support', icon: LifeBuoy },
    {
      label: user?.role === 'SELLER' ? 'Seller' : 'Account',
      href: user?.role === 'SELLER' ? '/seller' : '/account',
      icon: user?.role === 'SELLER' ? Store : User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-emerald-950/95 backdrop-blur-lg border-t border-emerald-900 px-2 py-1 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full py-1 text-[11px] font-bold transition-all ${
                isActive ? 'text-amber-400' : 'text-emerald-200/70 hover:text-white'
              }`}
            >
              <div className="relative">
                {item.isCart ? (
                  <div className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <CartIcon className="w-5 h-5" />
                  </div>
                ) : (
                  Icon && <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-emerald-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-950">
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
