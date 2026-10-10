'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Send,
  HelpCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

export default function CustomerSupportPage() {
  const { user, token } = useAuth();

  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal for new ticket
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order Issue');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Active ticket conversation
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchSupportData = () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/support/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE_URL}/api/v1/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([ticketRes, orderRes]) => {
        if (ticketRes.ok) {
          const tData = await ticketRes.json();
          setTickets(Array.isArray(tData) ? tData : []);
          if (activeTicket) {
            const updatedActive = tData.find((t: any) => t.id === activeTicket.id);
            if (updatedActive) setActiveTicket(updatedActive);
          }
        }
        if (orderRes.ok) {
          const oData = await orderRes.json();
          setOrders(Array.isArray(oData) ? oData : []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSupportData();
  }, [token]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !subject.trim() || !initialMessage.trim()) return;

    setSubmittingTicket(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          category,
          orderId: selectedOrderId || undefined,
          message: initialMessage,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create ticket');
      }

      setShowNewTicketModal(false);
      setSubject('');
      setInitialMessage('');
      setSelectedOrderId('');
      fetchSupportData();
    } catch (err: any) {
      alert(err.message || 'Error creating support ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeTicket || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/support/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      });

      if (!res.ok) throw new Error('Failed to post message reply');

      setReplyMessage('');
      fetchSupportData();
    } catch (err: any) {
      alert(err.message || 'Could not send message');
    } finally {
      setSendingReply(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <LifeBuoy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-white mb-2">Customer Support Desk</h1>
        <p className="text-gray-400 mb-6">Please log in to view your tickets or open a new customer support dispute.</p>
        <a href="/account" className="px-6 py-3 rounded-xl bg-brand-500 text-dark-900 font-extrabold text-sm">
          Sign In to Your Account
        </a>
      </div>
    );
  }

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" /> Escrow Buyer Protection & Help
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Customer Support & Disputes</h1>
          <p className="text-gray-400 text-sm mt-1">
            Directly communicate with Nuvora customer resolution specialists regarding orders, payments, and product inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSupportData}
            className="p-2.5 rounded-xl bg-dark-800 border border-gray-700 text-gray-300 hover:text-white transition-all"
            title="Refresh Tickets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-dark-900 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Open New Ticket</span>
          </button>
        </div>
      </div>

      {/* Support Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-900/60 border border-gray-800 p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-amber-400 mb-3">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <h3 className="text-white font-bold text-base">Escrow Guarantee</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Payment funds are held securely until delivery is confirmed. If a delivery dispute occurs, our resolution team steps in.
          </p>
        </div>

        <div className="bg-dark-900/60 border border-gray-800 p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-white font-bold text-base">Fast Turnaround</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Our support desk operates 24/7 with typical first-response times under 30 minutes for order issues.
          </p>
        </div>

        <div className="bg-dark-900/60 border border-gray-800 p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-white font-bold text-base">Verified Resolution</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Approved returns automatically trigger proportional commission reversals and instant wallet or bank refunds.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-3 overflow-x-auto text-xs font-bold">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl transition-all ${
              filterStatus === status
                ? 'bg-brand-500 text-dark-900 font-extrabold shadow-md'
                : 'text-gray-400 hover:text-white bg-dark-800/50'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Ticket List and Conversation Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List Column - Hidden on mobile when chat is active */}
        <div className={`space-y-3 ${activeTicket ? 'hidden lg:block lg:col-span-5' : 'col-span-12'}`}>
          {loading ? (
            <div className="text-center py-16 text-gray-500">Loading support tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-dark-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
              <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="font-bold text-white text-base">No support tickets found</p>
              <p className="text-xs text-gray-500 mt-1">You have no tickets matching this filter status.</p>
              <button
                onClick={() => setShowNewTicketModal(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-500 text-dark-900 font-bold text-xs"
              >
                Open Ticket Now
              </button>
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTicket(t)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeTicket?.id === t.id
                    ? 'bg-dark-800 border-brand-500/80 shadow-xl shadow-brand-500/5'
                    : 'bg-dark-900/80 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400">{t.ticketNumber}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      t.status === 'OPEN'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : t.status === 'RESOLVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-white font-bold text-sm mb-1">{t.subject}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Category: {t.category}</span>
                  {t.order && (
                    <span className="text-brand-400 font-mono">Order: #{t.order.orderNumber}</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> {t.messages?.length || 0} messages
                  </span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Conversation Thread Column */}
        {activeTicket && (
          <div className="col-span-12 lg:col-span-7 bg-dark-900 border border-gray-800 rounded-2xl p-4 sm:p-6 flex flex-col h-[550px] sm:h-[650px] shadow-2xl">
            {/* Thread Header */}
            <div className="pb-4 border-b border-gray-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">{activeTicket.ticketNumber}</span>
                  <span className="text-xs text-gray-400 truncate">• {activeTicket.category}</span>
                </div>
                <h3 className="text-white font-black text-base sm:text-lg truncate">{activeTicket.subject}</h3>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 bg-dark-800 rounded-xl border border-gray-700 font-bold shrink-0 flex items-center gap-1"
              >
                ← Back
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
              {activeTicket.messages?.map((msg: any) => {
                const isCustomer = msg.senderRole === 'CUSTOMER';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1 px-1">
                      <span className="font-bold text-gray-300">
                        {isCustomer ? 'You' : 'Nuvora Support Officer'}
                      </span>
                      <span>• {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                        isCustomer
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

            {/* Reply Composer Form */}
            <form onSubmit={handleSendReply} className="pt-4 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                placeholder={
                  activeTicket.status === 'CLOSED'
                    ? 'This ticket is closed.'
                    : 'Type your message reply here...'
                }
                disabled={activeTicket.status === 'CLOSED' || sendingReply}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="flex-1 bg-dark-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={activeTicket.status === 'CLOSED' || sendingReply || !replyMessage.trim()}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-dark-900 font-extrabold text-sm rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-dark-900 border border-gray-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-white mb-1">Open a Support Ticket</h3>
            <p className="text-xs text-gray-400 mb-6">
              Our dispute resolution staff responds promptly to assist with inquiries or orders.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-dark-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Order Issue">Order Issue / Delivery Delay</option>
                  <option value="Payment Inquiry">Payment & Escrow Inquiry</option>
                  <option value="Refund & Return">Return & Refund Request</option>
                  <option value="Product Authenticity">Product Authenticity / Defect</option>
                  <option value="Account & Security">Account & Security Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Link to Order (Optional)</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full bg-dark-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">No specific order</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.orderNumber} - ₦{(o.totalAmountMinor / 100).toLocaleString()} ({o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Package arrived with missing accessories"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-dark-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Message Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide comprehensive details including dates, carrier tracking number, or issue specifics..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="w-full bg-dark-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-300 font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-dark-900 font-extrabold text-sm transition-all"
                >
                  {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
