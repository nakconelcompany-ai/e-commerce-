'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatMoney } from '@nuvora/shared';
import {
  Shield,
  Users,
  Store,
  Package,
  DollarSign,
  CheckCircle2,
  XCircle,
  Settings,
  Tag,
  CreditCard,
  LifeBuoy,
  FileCheck,
  Send,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'sellers' | 'kyc' | 'support' | 'payouts' | 'coupons'
  >('overview');

  const [metrics, setMetrics] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [couponVal, setCouponVal] = useState(1000); // 10% in BPS
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Support Ticket Modal/Reply state
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchAdminData = () => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      fetch('http://localhost:4000/api/v1/admin/overview', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:4000/api/v1/admin/sellers', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:4000/api/v1/admin/verification-docs', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:4000/api/v1/support/all-tickets', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:4000/api/v1/payouts/all-payouts', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:4000/api/v1/coupons', { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([mRes, sRes, kRes, supRes, pRes, cRes]) => {
        if (mRes.ok) setMetrics(await mRes.json());
        if (sRes.ok) setSellers(await sRes.json());
        if (kRes.ok) setKycDocs(await kRes.json());
        if (supRes.ok) {
          const supData = await supRes.json();
          setSupportTickets(Array.isArray(supData) ? supData : []);
          if (selectedTicket) {
            const updated = supData.find((t: any) => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
          }
        }
        if (pRes.ok) setPayouts(await pRes.json());
        if (cRes.ok) setCoupons(await cRes.json());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleReviewSeller = async (sellerId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/admin/sellers/${sellerId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to review seller application');
      alert(`Seller application ${status.toLowerCase()} successfully.`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error updating seller application');
    }
  };

  const handleReviewKycDoc = async (docId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/admin/verification-docs/${docId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update KYC document status');
      alert(`KYC Document marked as ${status}.`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error updating document status');
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update ticket status');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error updating ticket status');
    }
  };

  const handleAdminReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReply.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(`http://localhost:4000/api/v1/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: adminReply }),
      });

      if (!res.ok) throw new Error('Failed to send admin response');
      setAdminReply('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Could not send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleProcessPayout = async (payoutId: string, status: 'PAID' | 'FAILED') => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/payouts/${payoutId}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Payout processing failed');
      alert(`Payout marked as ${status}.`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error processing payout');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/v1/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode,
          discountType: couponType,
          discountValue: Number(couponVal),
        }),
      });
      if (!res.ok) throw new Error('Failed to create coupon');
      alert('Coupon created successfully!');
      setShowCouponModal(false);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Coupon creation failed');
    }
  };

  if (!token || (user?.role !== 'SUPER_ADMIN' && user?.role !== 'STAFF')) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-red-500 font-bold">
        Access Denied. Super Administrator or Staff privileges required.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-dark-900 text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 text-dark-900 font-black flex items-center justify-center text-xl shadow-lg shadow-brand-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Super Administrator Control Center</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Multi-Vendor Marketplace Governance, Escrow Payments & Support Desk (Phase 5 Active)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCouponModal(true)}
          className="px-5 py-3 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-sm shadow-lg flex items-center gap-2 active:scale-95 transition-all"
        >
          <Tag className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-3 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Platform Overview', icon: Shield },
          { id: 'support', label: `Support Desk (${supportTickets.filter(t => t.status === 'OPEN').length} Open)`, icon: LifeBuoy },
          { id: 'kyc', label: `KYC Compliance (${kycDocs.filter(d => d.verificationStatus === 'PENDING').length} Pending)`, icon: FileCheck },
          { id: 'sellers', label: `Sellers Moderation (${sellers.length})`, icon: Store },
          { id: 'payouts', label: `Payout Requests (${payouts.length})`, icon: CreditCard },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-dark-900 font-extrabold shadow-md'
                  : 'text-gray-400 hover:text-white bg-dark-900/60 border border-gray-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase block">Gross Merchandise Value (GMV)</span>
              <span className="text-2xl font-black text-gray-900">{formatMoney(metrics?.gmvMinor || 0, 'NGN')}</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase block">Platform Commission Earned</span>
              <span className="text-2xl font-black text-amber-600">{formatMoney(metrics?.platformCommissionRevenueMinor || 0, 'NGN')}</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase block">Total Orders</span>
              <span className="text-2xl font-black text-gray-900">{metrics?.totalOrders || 0}</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase block">Verified Sellers</span>
              <span className="text-2xl font-black text-emerald-600">{metrics?.totalSellers || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Support Desk Tab (Phase 5) */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={`space-y-3 ${selectedTicket ? 'hidden lg:block lg:col-span-5' : 'col-span-12'}`}>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-amber-400" /> Support & Dispute Tickets ({supportTickets.length})
            </h3>

            {supportTickets.length === 0 ? (
              <div className="bg-dark-900 p-8 rounded-2xl border border-gray-800 text-center text-xs text-gray-400">
                No support tickets found.
              </div>
            ) : (
              supportTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedTicket?.id === t.id
                      ? 'bg-dark-800 border-brand-500'
                      : 'bg-dark-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-amber-400">{t.ticketNumber}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        t.status === 'OPEN'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">{t.subject}</h4>
                  <div className="text-xs text-gray-400 flex items-center justify-between">
                    <span>{t.customer?.email}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedTicket && (
            <div className="col-span-12 lg:col-span-7 bg-dark-900 border border-gray-800 rounded-2xl p-4 sm:p-6 flex flex-col h-[550px] sm:h-[600px]">
              <div className="pb-4 border-b border-gray-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-mono text-amber-400 font-bold">{selectedTicket.ticketNumber}</span>
                  <h3 className="text-white font-black text-sm sm:text-base truncate">{selectedTicket.subject}</h3>
                  <span className="text-xs text-gray-400 truncate block">Customer: {selectedTicket.customer?.email}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                    className="bg-dark-800 border border-gray-700 rounded-lg text-xs font-bold text-white px-2 py-1.5"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-xs text-amber-400 hover:text-white px-2.5 py-1.5 bg-dark-800 rounded-lg border border-gray-700 font-bold"
                  >
                    ← Back
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                {selectedTicket.messages?.map((msg: any) => {
                  const isStaff = msg.senderRole !== 'CUSTOMER';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-gray-500 mb-0.5 px-1">
                        {isStaff ? 'Staff Support Agent' : 'Customer'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isStaff
                            ? 'bg-brand-500 text-dark-900 font-medium rounded-tr-none'
                            : 'bg-dark-800 border border-gray-700 text-gray-200 rounded-tl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Reply Form */}
              <form onSubmit={handleAdminReplyTicket} className="pt-3 border-t border-gray-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type official staff reply..."
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  className="flex-1 bg-dark-800 border border-gray-700 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={submittingReply || !adminReply.trim()}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-dark-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 3. KYC Compliance Tab (Phase 5) */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-sm">
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-600" /> Seller Verification Documents & CAC Compliance ({kycDocs.length})
          </h3>

          {kycDocs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No verification documents submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-slate-50 text-gray-800 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Store Name</th>
                    <th className="p-3">Document Type</th>
                    <th className="p-3">Document URL</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kycDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="p-3 font-bold text-gray-900">{doc.seller?.storeName}</td>
                      <td className="p-3 font-semibold text-gray-700">{doc.docType}</td>
                      <td className="p-3">
                        <a
                          href={doc.docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:underline flex items-center gap-1 font-bold"
                        >
                          <span>Preview Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                            doc.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : doc.verificationStatus === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        {doc.verificationStatus === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReviewKycDoc(doc.id, 'VERIFIED')}
                              className="px-3 py-1 rounded bg-emerald-600 text-white font-bold text-[11px]"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleReviewKycDoc(doc.id, 'REJECTED')}
                              className="px-3 py-1 rounded bg-red-600 text-white font-bold text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Sellers Moderation Tab */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-sm">
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-brand-600" /> Seller Applications Moderation
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-slate-50 text-gray-800 font-bold uppercase border-b border-gray-200">
                <tr>
                  <th className="p-3">Store Name</th>
                  <th className="p-3">Business Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-bold text-gray-900">{s.storeName}</td>
                    <td className="p-3">{s.businessName}</td>
                    <td className="p-3">{s.contactEmail} ({s.contactPhone})</td>
                    <td className="p-3 font-bold uppercase text-brand-600">{s.onboardingStatus}</td>
                    <td className="p-3">
                      {(s.onboardingStatus === 'SUBMITTED' || s.onboardingStatus === 'PENDING_VERIFICATION') && (
                        <div className="flex gap-2">
                          <button onClick={() => handleReviewSeller(s.id, 'APPROVED')} className="px-3 py-1 rounded bg-emerald-600 text-white font-bold">Approve</button>
                          <button onClick={() => handleReviewSeller(s.id, 'REJECTED')} className="px-3 py-1 rounded bg-red-600 text-white font-bold">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Payout Requests Tab */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-sm">
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" /> Seller Payout Requests ({payouts.length})
          </h3>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No payout requests awaiting processing.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-slate-50 text-gray-800 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Seller Store</th>
                    <th className="p-3">Bank Details</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payouts.map((pay) => (
                    <tr key={pay.id}>
                      <td className="p-3 font-mono font-bold text-gray-900">{pay.reference}</td>
                      <td className="p-3 font-bold text-emerald-600">{formatMoney(pay.amountMinor, 'NGN')}</td>
                      <td className="p-3 font-bold">{pay.seller?.storeName}</td>
                      <td className="p-3">{pay.bankName} ({pay.bankAccountNumber})</td>
                      <td className="p-3 font-bold uppercase text-amber-600">{pay.status}</td>
                      <td className="p-3">
                        {pay.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleProcessPayout(pay.id, 'PAID')} className="px-3 py-1 rounded bg-emerald-600 text-white font-bold">Mark Paid</button>
                            <button onClick={() => handleProcessPayout(pay.id, 'FAILED')} className="px-3 py-1 rounded bg-red-600 text-white font-bold">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-sm">
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-600" /> Promotional Coupons
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-slate-50 text-gray-800 font-bold uppercase border-b border-gray-200">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Times Used</th>
                  <th className="p-3">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="p-3 font-mono font-bold text-gray-900">{c.code}</td>
                    <td className="p-3">{c.discountType}</td>
                    <td className="p-3 font-bold">{c.discountType === 'PERCENTAGE' ? `${c.discountValue / 100}%` : formatMoney(c.discountValue, 'NGN')}</td>
                    <td className="p-3">{c.timesUsed}</td>
                    <td className="p-3 font-bold text-emerald-600">{c.isActive ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-extrabold text-gray-900">Create Promotional Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2 text-sm uppercase font-mono font-bold"
                  placeholder="e.g. NUVORA10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Discount Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (Kobo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Value (BPS or Kobo)</label>
                  <input
                    type="number"
                    required
                    value={couponVal}
                    onChange={(e) => setCouponVal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2 text-sm font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCouponModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl gold-gradient-bg text-dark-900 font-extrabold text-xs shadow">
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
