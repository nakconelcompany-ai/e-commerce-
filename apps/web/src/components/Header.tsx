'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/config';

export const Header = () => {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = () => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/v1/notifications/my-notifications`, {
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
      await fetch(`${API_BASE_URL}/api/v1/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
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
    <header className="sticky top-0 z-40 bg-emerald-950 text-white border-b border-emerald-900 shadow-xl">
      {/* Top Banner Notice with Emerald & Yellow Theme */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-yellow-300 font-bold text-xs py-2 px-4 text-center tracking-wide border-b border-emerald-800/80 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>🇳🇬 NUVORA MARKETPLACE • Free Express Delivery on Eligible Lagos & Abuja Orders over ₦50,000!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo Brand: Typography Only (Logo Graphic Removed) */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="leading-tight">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center">
                NUVORA<span className="text-amber-400">.</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-extrabold text-emerald-400 block -mt-1">
                MARKETPLACE
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Search smartphones, laptops, fashion, appliances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-emerald-900/60 text-white placeholder-emerald-200/60 text-sm rounded-xl pl-4 pr-12 py-3 border border-emerald-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-lg transition-colors shadow-sm"
              title="Search Products"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation Items (Cart Removed from Header as requested) */}
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link
              href="/seller"
              className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors bg-emerald-900/80 px-3.5 py-2 rounded-xl border border-emerald-800 text-xs font-bold shadow-sm"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Seller Hub</span>
            </Link>

            <Link
              href="/support"
              className="flex items-center gap-1.5 text-gray-200 hover:text-white transition-colors bg-emerald-900/60 px-3.5 py-2 rounded-xl border border-emerald-800 text-xs font-bold"
            >
              <LifeBuoy className="w-4 h-4 text-emerald-400" />
              <span>Help & Support</span>
            </Link>

            {user?.role === 'SUPER_ADMIN' || user?.role === 'STAFF' ? (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-red-300 hover:text-red-200 transition-colors bg-red-950/60 px-3.5 py-2 rounded-xl border border-red-800/60 text-xs font-bold"
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
                  className="relative p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-800 hover:border-emerald-700 text-gray-200 hover:text-white transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-emerald-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-emerald-950 border border-emerald-800 rounded-2xl shadow-2xl py-3 z-50">
                    <div className="px-4 pb-2 border-b border-emerald-800 flex items-center justify-between">
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

                    <div className="max-h-72 overflow-y-auto divide-y divide-emerald-900/50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-400">No new notifications.</div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition-colors ${
                              n.isRead ? 'bg-transparent text-gray-400' : 'bg-emerald-900/40 text-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-white text-xs">{n.title}</span>
                              {!n.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(n.id)}
                                  className="text-[10px] text-gray-400 hover:text-amber-400"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-300 leading-snug">{n.message}</p>
                            <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-emerald-300">
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
                <Link href="/account" className="flex items-center gap-2 hover:text-amber-300 py-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-900 border border-emerald-700 flex items-center justify-center text-amber-300 font-extrabold text-xs">
                    {user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate text-xs font-semibold">{user.email.split('@')[0]}</span>
                </Link>
                <div className="absolute right-0 top-full hidden group-hover:block w-48 bg-emerald-950 border border-emerald-800 rounded-xl shadow-2xl py-2 z-50">
                  <Link href="/account" className="block px-4 py-2 hover:bg-emerald-900 text-gray-200 text-xs font-medium">
                    My Account & Orders
                  </Link>
                  <Link href="/support" className="block px-4 py-2 hover:bg-emerald-900 text-gray-200 text-xs font-medium">
                    Help & Support Tickets
                  </Link>
                  {user.role === 'SELLER' && (
                    <Link href="/seller" className="block px-4 py-2 hover:bg-emerald-900 text-amber-400 text-xs font-semibold">
                      Seller Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-900 text-red-400 text-xs flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/account"
                className="flex items-center gap-1.5 text-gray-200 hover:text-white bg-emerald-900/80 px-3.5 py-2 rounded-xl border border-emerald-800 text-xs font-bold transition-all"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-200 hover:text-white"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-400 text-emerald-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-200">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar in Header */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-emerald-900/60 text-white placeholder-emerald-200/60 text-xs rounded-xl pl-3.5 pr-10 py-2.5 border border-emerald-800 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 p-1.5 bg-amber-400 text-emerald-950 rounded-lg text-xs"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Mobile Flyout Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-900 space-y-3">
            <Link
              href="/seller"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-900/60 text-amber-300 text-xs font-bold"
            >
              <Store className="w-4 h-4" />
              <span>Seller Hub</span>
            </Link>
            <Link
              href="/support"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-900/60 text-gray-200 text-xs font-bold"
            >
              <LifeBuoy className="w-4 h-4 text-emerald-400" />
              <span>Help & Support</span>
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-900/60 text-gray-200 text-xs font-bold"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>{user ? 'My Account' : 'Sign In / Register'}</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
