import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { FloatingDraggableCart } from '@/components/FloatingDraggableCart';

export const metadata: Metadata = {
  title: 'Nuvora Marketplace | Premium Multi-Vendor E-Commerce Platform',
  description: 'Shop top deals from verified sellers across Nigeria. Fast nationwide delivery, escrow protected payments, original laptops, smartphones, fashion & home appliances.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#06261d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-950">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
            {/* Movable, Draggable Cart Widget anywhere in the body */}
            <FloatingDraggableCart />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
