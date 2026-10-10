'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reference) {
      setVerifying(false);
      setMessage('No payment reference specified');
      return;
    }

    fetch(`http://localhost:4000/api/v1/payments/verify/${reference}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.status === 'success') {
          setSuccess(true);
          setMessage('Payment verified successfully! Your order has been placed and assigned to sellers.');
        } else {
          setSuccess(false);
          setMessage(data.message || 'Payment verification failed.');
        }
      })
      .catch((err) => {
        setSuccess(false);
        setMessage(err.message || 'Unable to connect to verification server');
      })
      .finally(() => setVerifying(false));
  }, [reference]);

  if (verifying) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-xl font-bold">Verifying payment with Paystack...</h2>
        <p className="text-xs text-gray-500">Please do not close this window</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
      {success ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-extrabold text-gray-900">Payment Successful!</h2>
          <p className="text-sm text-gray-600">{message}</p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/account"
              className="px-6 py-3 rounded-xl bg-brand-500 text-dark-900 font-extrabold text-sm shadow-md flex items-center gap-2"
            >
              <span>View Order History</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-extrabold text-gray-900">Payment Verification Issue</h2>
          <p className="text-sm text-gray-600">{message}</p>
          <div className="pt-4 flex justify-center gap-4">
            <Link href="/cart" className="px-6 py-3 rounded-xl bg-dark-900 text-white font-bold text-sm">
              Return to Shopping Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Verifying transaction...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
