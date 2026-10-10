'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  User,
  Store,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  LifeBuoy,
  Check,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export const Header = () => {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = () => {
    if (!token) return;
    fetch('http://localhost:4000/api/v1/notifications/my-notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`http://localhost:4000/api/v1/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await fetch('http://localhost:4000/api/v1/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (e) {}
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-900 text-white border-b border-gray-800 shadow-xl">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-500 to-amber-600 text-dark-900 font-semibold text-xs py-1.5 px-4 text-center tracking-wide">
        🇳🇬 NUVORA MARKETPLACE • Free Express Delivery on Eligible Lagos & Abuja Orders over ₦50,000!
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-brand-500/40 group-hover:border-brand-400 transition-all shadow-lg shadow-brand-500/10">
              <Image src="/logo.png" alt="Nuvora Logo" fill className="object-cover" priority />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight gold-gradient-text uppercase">NUVORA</span>
              <span className="block text-[10px] font-medium tracking-widest text-gray-400 uppercase">Marketplace</span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Search smartphones, laptops, fashion, appliances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800 text-white placeholder-gray-400 text-sm rounded-xl pl-4 pr-12 py-3 border border-gray-700 focus:outline-none focus:border-brand-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 bg-brand-500 hover:bg-brand-600 text-dark-900 font-bold rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link
              href="/seller"
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors bg-brand-500/10 px-3 py-1.5 rounded-lg border border-brand-500/20 text-xs font-bold"
            >
              <Store className="w-4 h-4" />
              <span>Seller Hub</span>
            </Link>

            <Link
              href="/support"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors bg-dark-800/80 px-3 py-1.5 rounded-lg border border-gray-700 text-xs font-bold"
            >
              <LifeBuoy className="w-4 h-4 text-amber-400" />
              <span>Help & Support</span>
            </Link>

            {user?.role === 'SUPER_ADMIN' || user?.role === 'STAFF' ? (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-bold"
              >
                <Shield className="w-4 h-4" />
                <span>Super Admin</span>
              </Link>
            ) : null}

            {/* Notification Bell Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl bg-dark-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-dark-900 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-dark-900 border border-gray-800 rounded-2xl shadow-2xl py-3 z-50">
                    <div className="px-4 pb-2 border-b border-gray-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Alerts & Activity</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-800/50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-500">No new notifications.</div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition-colors ${
                              n.isRead ? 'bg-transparent text-gray-400' : 'bg-brand-500/5 text-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-white text-xs">{n.title}</span>
                              {!n.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(n.id)}
                                  className="text-[10px] text-gray-500 hover:text-amber-400"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 leading-snug">{n.message}</p>
                            <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-gray-500">
                              <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {n.link && (
                                <Link
                                  href={n.link}
                                  onClick={() => setShowNotifications(false)}
                                  className="text-amber-400 hover:underline flex items-center gap-1"
                                >
                                  <span>View</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account / Auth Dropdown */}
            {user ? (
              <div className="relative group">
                <Link href="/account" className="flex items-center gap-2 hover:text-brand-400 py-2">
                  <div className="w-8 h-8 rounded-full bg-dark-800 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-xs">
                    {user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate text-xs font-semibold">{user.email.split('@')[0]}</span>
                </Link>
                <div className="absolute right-0 top-full hidden group-hover:block w-48 bg-dark-800 border border-gray-700 rounded-xl shadow-2xl py-2 z-50">
                  <Link href="/account" className="block px-4 py-2 hover:bg-dark-700 text-gray-200 text-xs font-medium">
                    My Account & Orders
                  </Link>
                  <Link href="/support" className="block px-4 py-2 hover:bg-dark-700 text-gray-200 text-xs font-medium">
                    Help & Support Tickets
                  </Link>
                  {user.role === 'SELLER' && (
                    <Link href="/seller" className="block px-4 py-2 hover:bg-dark-700 text-amber-400 text-xs font-semibold">
                      Seller Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-dark-700 text-red-400 text-xs flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/account"
                className="flex items-center gap-1.5 text-gray-200 hover:text-white transition-colors text-xs font-bold"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Sign In / Register</span>
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-gray-700 px-4 py-2 rounded-xl text-white transition-all text-xs"
            >
              <ShoppingBag className="w-4 h-4 text-brand-400" />
              <span className="font-bold">{totalItems}</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-dark-900 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-dark-900">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1">
            {user && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-300 hover:text-white"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-dark-900 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <Link href="/cart" className="relative p-2 text-brand-400">
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-brand-500 text-dark-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-300">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Notifications Drawer/Panel */}
        {showNotifications && (
          <div className="md:hidden py-3 border-t border-gray-800 space-y-2">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-gray-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" /> Notifications & Alerts
              </span>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-800/50">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500">No new notifications.</div>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs transition-colors rounded-xl mb-1 ${
                      n.isRead ? 'bg-transparent text-gray-400' : 'bg-brand-500/10 text-gray-200 border border-brand-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-white text-xs">{n.title}</span>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-[10px] text-gray-400 hover:text-amber-400 p-0.5"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-snug">{n.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-gray-500">
                      <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => setShowNotifications(false)}
                          className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <span>View</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Mobile Search & Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="py-4 md:hidden border-t border-gray-800 space-y-4">
            <form onSubmit={handleSearch} className="flex items-center relative">
              <input
                type="text"
                placeholder="Search marketplace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-800 text-white placeholder-gray-400 text-sm rounded-xl pl-4 pr-10 py-2.5 border border-gray-700"
              />
              <button type="submit" className="absolute right-2 p-1.5 text-brand-400">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link href="/seller" className="p-3 bg-dark-800 rounded-xl text-amber-400 border border-gray-700">
                Seller Hub
              </Link>
              <Link href="/support" className="p-3 bg-dark-800 rounded-xl text-gray-200 border border-gray-700">
                Help & Support
              </Link>
              <Link href="/account" className="p-3 bg-dark-800 rounded-xl text-gray-200 border border-gray-700">
                My Account
              </Link>
              {user?.role === 'SUPER_ADMIN' && (
                <Link href="/admin" className="p-3 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
                  Super Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
