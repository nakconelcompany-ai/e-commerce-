'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatMoney } from '@nuvora/shared';
import {
  Store,
  DollarSign,
  Package,
  TrendingUp,
  Plus,
  ShieldCheck,
  Truck,
  Check,
  CreditCard,
  FileCheck,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  X,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function SellerPortalPage() {
  const { user, token } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Application form fields
  const [businessName, setBusinessName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [stateName, setStateName] = useState('Lagos');
  const [cityName, setCityName] = useState('Lagos');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('GTBank');
  const [submittingApp, setSubmittingApp] = useState(false);

  // New product form fields
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPriceNaira, setProdPriceNaira] = useState(50000);
  const [prodSku, setProdSku] = useState('');
  const [prodStock, setProdStock] = useState(10);
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Payout request modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmountNaira, setPayoutAmountNaira] = useState(10000);
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // KYC Document Upload Modal
  const [showKycModal, setShowKycModal] = useState(false);
  const [docType, setDocType] = useState('CAC Certificate');
  const [docUrl, setDocUrl] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);

  // Carrier Dispatch Modal
  const [dispatchOrder, setDispatchOrder] = useState<any>(null);
  const [carrierName, setCarrierName] = useState('GIG Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submittingDispatch, setSubmittingDispatch] = useState(false);

  const fetchSellerData = () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetch('http://localhost:4000/api/v1/seller/profile', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:4000/api/v1/seller/overview', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:4000/api/v1/orders/seller-orders', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:4000/api/v1/payouts/my-payouts', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:4000/api/v1/seller/verification-docs', { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([pRes, oRes, sRes, payRes, docRes]) => {
        if (pRes.ok) setProfile(await pRes.json());
        if (oRes.ok) setMetrics(await oRes.json());
        if (sRes.ok) setSellerOrders(await sRes.json());
        if (payRes.ok) setPayouts(await payRes.json());
        if (docRes.ok) setKycDocs(await docRes.json());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSellerData();
  }, [token]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingApp(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/seller/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName,
          storeName,
          contactEmail: contactEmail || user?.email,
          contactPhone: contactPhone || user?.phone,
          businessAddress,
          state: stateName,
          city: cityName,
          bankAccountName,
          bankAccountNumber,
          bankName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Application failed');

      alert('Seller store application submitted successfully!');
      fetchSellerData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleUploadKycDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUrl.trim()) return;

    setSubmittingDoc(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/seller/verification-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ docType, docUrl }),
      });

      if (!res.ok) throw new Error('Failed to upload verification document');

      alert('Document submitted for admin verification!');
      setShowKycModal(false);
      setDocUrl('');
      fetchSellerData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setSubmittingDoc(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProduct(true);
    try {
      const basePriceMinor = Math.round(prodPriceNaira * 100);
      const res = await fetch('http://localhost:4000/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: prodTitle,
          description: prodDesc,
          categorySlug: 'phones-tablets',
          basePriceMinor,
          sku: prodSku.toUpperCase(),
          images: [
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
          ],
          variants: [
            {
              title: 'Standard',
              sku: `${prodSku.toUpperCase()}-STD`,
              priceMinor: basePriceMinor,
              stockQuantity: Number(prodStock),
              isDefault: true,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Product creation failed');

      alert('Product created and listed successfully!');
      setShowProductModal(false);
      fetchSellerData();
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleRequestPayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPayout(true);
    try {
      const amountMinor = Math.round(payoutAmountNaira * 100);
      const res = await fetch('http://localhost:4000/api/v1/payouts/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amountMinor }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payout request failed');

      alert('Payout request submitted successfully!');
      setShowPayoutModal(false);
      fetchSellerData();
    } catch (err: any) {
      alert(err.message || 'Payout request error');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const handleUpdateStatus = async (sellerOrderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/orders/seller-orders/${sellerOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Status update failed');
      }
      fetchSellerData();
    } catch (err: any) {
      alert(err.message || 'Error updating order status');
    }
  };

  const handleStartDispatch = (so: any) => {
    setDispatchOrder(so);
    setCarrierName(so.carrierName || 'GIG Logistics');
    setTrackingNumber(so.trackingNumber || `NUV-EXP-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrder) return;
    setSubmittingDispatch(true);
    try {
      const res = await fetch(`http://localhost:4000/api/v1/orders/seller-orders/${dispatchOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'dispatched',
          carrierName,
          trackingNumber: trackingNumber.trim() || `NUV-EXP-${Date.now()}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Dispatch update failed');
      }
      setDispatchOrder(null);
      fetchSellerData();
    } catch (err: any) {
      alert(err.message || 'Error confirming shipment dispatch');
    } finally {
      setSubmittingDispatch(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'awaiting_processing':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 uppercase">Awaiting Processing</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 uppercase">Processing</span>;
      case 'ready_for_dispatch':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700 uppercase">Ready For Dispatch</span>;
      case 'dispatched':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 uppercase">Dispatched (Shipped)</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 uppercase">Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 uppercase">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700 uppercase">{status.replace('_', ' ')}</span>;
    }
  };

  if (!token) return <div className="max-w-4xl mx-auto p-12 text-center text-gray-500">Please sign in to access the Seller Portal.</div>;
  if (loading) return <div className="max-w-7xl mx-auto p-12 text-center text-gray-500">Loading seller dashboard...</div>;

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto my-6 sm:my-12 p-6 sm:p-8 bg-white rounded-3xl border border-gray-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-brand-600">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Seller Onboarding Application</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">Fill in your business details to start listing products on Nuvora.</p>
        </div>

        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Registered Business Name</label>
              <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm" placeholder="e.g. Apex Tech Ltd" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Store Name</label>
              <input type="text" required value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm" placeholder="e.g. Apex Tech Hub" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Email</label>
              <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Phone</label>
              <input type="text" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Business Address</label>
            <input type="text" required value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bank Name</label>
              <input type="text" required value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm" placeholder="e.g. GTBank / Zenith" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Account Name</label>
              <input type="text" required value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Account Number</label>
              <input type="text" required maxLength={10} value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono" placeholder="0123456789" />
            </div>
          </div>
          <button type="submit" disabled={submittingApp} className="w-full py-3.5 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-sm shadow-md transition-transform active:scale-[0.98]">
            {submittingApp ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-dark-900 text-white p-5 sm:p-8 rounded-3xl border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500 text-dark-900 font-extrabold flex items-center justify-center text-xl shrink-0 shadow-lg shadow-amber-500/20">
            {profile.storeName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{profile.storeName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                {profile.onboardingStatus}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Payout: {profile.bankName} ({profile.bankAccountNumber})
            </p>
          </div>
        </div>

        {/* Action Buttons Grid on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setShowKycModal(true)}
            className="px-4 py-3 rounded-xl bg-dark-800 border border-gray-700 hover:border-gray-600 text-amber-400 font-extrabold text-xs shadow flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            <span>Upload KYC</span>
          </button>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-900 font-extrabold text-xs shadow flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Request Payout</span>
          </button>
          <button
            onClick={() => setShowProductModal(true)}
            className="px-4 py-3 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-xs shadow flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>List Product</span>
          </button>
        </div>
      </div>

      {/* Operational Metrics (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-1 sm:space-y-2">
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase block tracking-wider">Gross Sales</span>
          <span className="text-lg sm:text-2xl font-black text-gray-900 block truncate">{formatMoney(metrics?.grossSalesMinor || 0, 'NGN')}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-1 sm:space-y-2">
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase block tracking-wider">Commission (5%)</span>
          <span className="text-lg sm:text-2xl font-black text-amber-600 block truncate">{formatMoney(metrics?.commissionMinor || 0, 'NGN')}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-1 sm:space-y-2">
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase block tracking-wider">Net Balance</span>
          <span className="text-lg sm:text-2xl font-black text-emerald-600 block truncate">{formatMoney(metrics?.netEarningsMinor || 0, 'NGN')}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-1 sm:space-y-2">
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase block tracking-wider">Total Orders</span>
          <span className="text-lg sm:text-2xl font-black text-gray-900 block truncate">{metrics?.totalOrders || 0}</span>
        </div>
      </div>

      {/* KYC Compliance Section */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Business KYC & Verification ({kycDocs.length})</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified sellers receive trusted merchant badges and higher order volume.
            </p>
          </div>
          <button
            onClick={() => setShowKycModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold text-xs flex items-center gap-1.5 transition-colors self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>

        {kycDocs.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
            No verification documents submitted yet. Upload your CAC Certificate or Government ID to get verified.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {kycDocs.map((doc) => (
              <div key={doc.id} className="p-4 bg-slate-50 border border-gray-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 truncate pr-2">{doc.docType}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase shrink-0 ${
                      doc.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : doc.verificationStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.verificationStatus}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center justify-between pt-2 border-t border-gray-200">
                  <a
                    href={doc.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Document</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seller Orders Management (Responsive Cards on Mobile + Table on Desktop) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-600 shrink-0" />
            <span>Assigned Fulfillment Orders ({sellerOrders.length})</span>
          </h3>
        </div>

        {sellerOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            No customer orders assigned to your store yet.
          </div>
        ) : (
          <>
            {/* Mobile Cards View (< 768px) */}
            <div className="space-y-3 block md:hidden">
              {sellerOrders.map((so) => (
                <div key={so.id} className="p-4 rounded-2xl border border-gray-200 bg-slate-50 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-gray-900">{so.orderNumber}</span>
                    {getStatusBadge(so.status)}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">Items:</span>
                    <div className="text-xs text-gray-800 font-medium bg-white p-2.5 rounded-xl border border-gray-200">
                      {so.items?.map((i: any) => `${i.productTitle} (x${i.quantity})`).join(', ') || 'No item details'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">Your Earning</span>
                      <span className="text-sm font-extrabold text-emerald-600">{formatMoney(so.sellerEarningMinor, 'NGN')}</span>
                    </div>

                    {so.trackingNumber && (
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Carrier</span>
                        <span className="text-xs font-mono font-bold text-indigo-700">{so.carrierName || 'Carrier'}: {so.trackingNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="pt-2 border-t border-gray-200">
                    {so.status === 'awaiting_processing' && (
                      <button
                        onClick={() => handleUpdateStatus(so.id, 'processing')}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow"
                      >
                        Start Processing
                      </button>
                    )}
                    {so.status === 'processing' && (
                      <button
                        onClick={() => handleUpdateStatus(so.id, 'ready_for_dispatch')}
                        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow"
                      >
                        Ready For Dispatch
                      </button>
                    )}
                    {so.status === 'ready_for_dispatch' && (
                      <button
                        onClick={() => handleStartDispatch(so)}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch (Assign Carrier & Ship)</span>
                      </button>
                    )}
                    {so.status === 'dispatched' && (
                      <button
                        onClick={() => handleUpdateStatus(so.id, 'delivered')}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Delivery</span>
                      </button>
                    )}
                    {so.status === 'delivered' && (
                      <div className="text-center text-xs font-extrabold text-emerald-600 py-1">
                        ✓ Delivery Complete
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-slate-50 text-gray-800 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Order #</th>
                    <th className="p-3">Products</th>
                    <th className="p-3">Net Earning</th>
                    <th className="p-3">Carrier / Tracking</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sellerOrders.map((so) => (
                    <tr key={so.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-gray-900">{so.orderNumber}</td>
                      <td className="p-3 max-w-xs">{so.items?.map((i: any) => `${i.productTitle} (x${i.quantity})`).join(', ')}</td>
                      <td className="p-3 font-bold text-emerald-600">{formatMoney(so.sellerEarningMinor, 'NGN')}</td>
                      <td className="p-3 font-mono text-[11px] text-gray-700">
                        {so.trackingNumber ? `${so.carrierName || 'Express'}: ${so.trackingNumber}` : '—'}
                      </td>
                      <td className="p-3">{getStatusBadge(so.status)}</td>
                      <td className="p-3">
                        {so.status === 'awaiting_processing' && (
                          <button onClick={() => handleUpdateStatus(so.id, 'processing')} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors">Start Processing</button>
                        )}
                        {so.status === 'processing' && (
                          <button onClick={() => handleUpdateStatus(so.id, 'ready_for_dispatch')} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors">Ready for Dispatch</button>
                        )}
                        {so.status === 'ready_for_dispatch' && (
                          <button onClick={() => handleStartDispatch(so)} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" /> Dispatch (Ship)
                          </button>
                        )}
                        {so.status === 'dispatched' && (
                          <button onClick={() => handleUpdateStatus(so.id, 'delivered')} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Confirm Delivery
                          </button>
                        )}
                        {so.status === 'delivered' && (
                          <span className="text-emerald-600 font-bold text-xs">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Seller Payout History Table (Responsive on Mobile) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 space-y-5 shadow-sm">
        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Payout Transfers History ({payouts.length})</span>
        </h3>

        {payouts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">No payout requests submitted yet.</div>
        ) : (
          <>
            {/* Mobile Payout Cards (< 768px) */}
            <div className="space-y-3 block md:hidden">
              {payouts.map((pay) => (
                <div key={pay.id} className="p-4 rounded-2xl border border-gray-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-900">{pay.reference}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                      {pay.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600 text-sm">{formatMoney(pay.amountMinor, 'NGN')}</span>
                    <span className="text-gray-500 text-[11px]">{new Date(pay.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 pt-1 border-t border-gray-200">
                    Bank: {pay.bankName} ({pay.bankAccountNumber})
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop Payout Table (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-slate-50 text-gray-800 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Bank Details</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payouts.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-gray-900">{pay.reference}</td>
                      <td className="p-3 font-bold text-emerald-600">{formatMoney(pay.amountMinor, 'NGN')}</td>
                      <td className="p-3">{pay.bankName} ({pay.bankAccountNumber})</td>
                      <td className="p-3 font-bold uppercase text-amber-600">{pay.status}</td>
                      <td className="p-3 text-gray-400">{new Date(pay.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Carrier Dispatch Modal */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>Dispatch Shipment</span>
              </h3>
              <button onClick={() => setDispatchOrder(null)} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Assign logistics carrier details to fulfill Order <strong className="text-gray-900 font-mono">{dispatchOrder.orderNumber}</strong>.
            </p>

            <form onSubmit={handleConfirmDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Logistics Carrier</label>
                <select
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-bold"
                >
                  <option value="GIG Logistics">GIG Logistics</option>
                  <option value="DHL Express">DHL Express Nigeria</option>
                  <option value="Kwik Delivery">Kwik Delivery</option>
                  <option value="Speedaf Logistics">Speedaf Express</option>
                  <option value="Nuvora Express">Nuvora Internal Fleet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Waybill / Tracking Number</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold"
                  placeholder="e.g. NUV-EXP-829102"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                The buyer will be notified with real-time tracking credentials once confirmed.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setDispatchOrder(null)} className="px-4 py-2 text-xs font-bold text-gray-600">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispatch}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow transition-colors"
                >
                  {submittingDispatch ? 'Confirming...' : 'Confirm Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC Upload Modal */}
      {showKycModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900">Upload KYC Verification Document</h3>
              <button onClick={() => setShowKycModal(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">Provide proof of corporate registration or verified government identity.</p>

            <form onSubmit={handleUploadKycDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-bold"
                >
                  <option value="CAC Certificate">CAC Corporate Registration Certificate</option>
                  <option value="National Identity (NIN / Passport)">National ID (NIN / Voter Card / Passport)</option>
                  <option value="Proof of Address / Utility Bill">Proof of Address / Utility Bill</option>
                  <option value="Tax Clearance / TIN">Tax Identification Certificate (TIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Document URL / Cloud Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or cloud storage URL"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowKycModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600">
                  Cancel
                </button>
                <button type="submit" disabled={submittingDoc} className="px-6 py-2.5 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-xs shadow">
                  {submittingDoc ? 'Uploading...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900">Request Earnings Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRequestPayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount to Transfer (NGN)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={payoutAmountNaira}
                  onChange={(e) => setPayoutAmountNaira(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-extrabold"
                />
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
                Payout will be disbursed to <strong>{profile.bankName} ({profile.bankAccountNumber})</strong>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPayoutModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600">Cancel</button>
                <button type="submit" disabled={submittingPayout} className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-900 font-extrabold text-xs shadow">
                  {submittingPayout ? 'Submitting...' : 'Confirm Payout Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900">List New Product on Nuvora</h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Title</label>
                <input type="text" required value={prodTitle} onChange={(e) => setProdTitle(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm" placeholder="e.g. Wireless Smart Earbuds Pro" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea rows={3} required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (NGN)</label>
                  <input type="number" required value={prodPriceNaira} onChange={(e) => setProdPriceNaira(Number(e.target.value))} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">SKU</label>
                  <input type="text" required value={prodSku} onChange={(e) => setProdSku(e.target.value)} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono uppercase" placeholder="APX-01" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock Qty</label>
                  <input type="number" required value={prodStock} onChange={(e) => setProdStock(Number(e.target.value))} className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600">Cancel</button>
                <button type="submit" disabled={creatingProduct} className="px-6 py-2.5 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-xs shadow">
                  {creatingProduct ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
