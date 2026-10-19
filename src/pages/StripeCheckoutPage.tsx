import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CreditCard, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const StripeCheckoutPage: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paying, setPaying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Card input states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [cardName, setCardName] = useState('');
  const [country, setCountry] = useState('United States');

  const sessionId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('session_id')
    : null;

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid checkout session reference.');
      setLoading(false);
      return;
    }

    fetch(`/api/v1/stripe/checkout-session/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSession(data.data);
          if (data.data.customer_details?.name) {
            setCardName(data.data.customer_details.name);
          }
        } else {
          setError(data.message || 'Unable to retrieve checkout session.');
        }
      })
      .catch(err => {
        setError(err.message || 'Connection to checkout gateway failed.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !session) return;
    setPaying(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/stripe/checkout-session/${sessionId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_number: cardNumber,
          card_holder: cardName,
          card_expiry: cardExpiry
        })
      });

      const data = await res.json();
      if (data.success && data.data?.redirect_url) {
        window.location.href = data.data.redirect_url;
      } else {
        throw new Error(data.message || 'Payment processing failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Payment could not be completed.');
      setPaying(false);
    }
  };

  const handleCancel = () => {
    if (session?.cancel_url) {
      window.location.href = session.cancel_url;
    } else {
      window.location.href = '/register';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium font-mono">Connecting to Stripe Checkout Gateway...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 font-display">Checkout Error</h2>
          <p className="text-xs text-slate-600">{error}</p>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Return to Registration
          </button>
        </div>
      </div>
    );
  }

  const amount = session?.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
  const currency = (session?.currency || 'USD').toUpperCase();
  const confTitle = session?.metadata?.conference_title || 'SCINS Scientific Conference';
  const catTitle = session?.metadata?.category_name || 'Delegate Pass';
  const orderRef = session?.client_reference_id || session?.metadata?.registration_id;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans selection:bg-teal-500 selection:text-white">
      {/* Left Column: Order Summary & Brand Header */}
      <div className="w-full md:w-1/2 bg-slate-900 text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
        <div className="space-y-8">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Cancel and return to SCINS MEDIA</span>
          </button>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold bg-teal-950 px-2.5 py-1 rounded-md border border-teal-800 inline-block">
              SCINS MEDIA • Verified Stripe Checkout
            </span>
            <div className="text-slate-400 text-xs">Total Amount Due</div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
              {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}{amount}{' '}
              <span className="text-lg font-semibold text-teal-400">{currency}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{confTitle}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{catTitle}</p>
                {orderRef && (
                  <p className="text-[11px] font-mono text-teal-300 mt-1">Ref: {orderRef}</p>
                )}
              </div>
              <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg">
                Qty 1
              </span>
            </div>
            <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-400">Delegate</span>
              <span className="font-semibold text-slate-200">
                {session?.customer_details?.name || session?.metadata?.delegate_name || 'Conference Delegate'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 text-xs text-slate-400 space-y-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Guaranteed secure payment powered by Stripe</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Merchant: SCINS MEDIA INTERNATIONAL • Estonia, Europe
          </div>
        </div>
      </div>

      {/* Right Column: Stripe Payment Form */}
      <div className="w-full md:w-1/2 bg-white p-6 sm:p-10 lg:p-14 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Pay with Card
            </h3>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={session?.customer_email || ''}
                readOnly
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Card Information</label>
              <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600">
                <div className="flex items-center bg-white px-3.5 py-2.5 border-b border-slate-200">
                  <CreditCard className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="1234 1234 1234 1234"
                    className="w-full text-xs font-mono text-slate-900 focus:outline-none bg-transparent"
                  />
                  <div className="flex items-center space-x-1 shrink-0">
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded">VISA</span>
                    <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1 py-0.5 rounded">MC</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-200 bg-white">
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    placeholder="MM / YY"
                    className="px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none bg-transparent"
                  />
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value)}
                    placeholder="CVC"
                    className="px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                required
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="Full name on card"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country / Region</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Estonia">Estonia</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="India">India</option>
                <option value="Japan">Japan</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={paying}
              className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {paying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}{amount} {currency}</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-400 font-mono">
            By confirming payment, you authorize SCINS MEDIA to charge your card.
          </div>
        </div>
      </div>
    </div>
  );
};
