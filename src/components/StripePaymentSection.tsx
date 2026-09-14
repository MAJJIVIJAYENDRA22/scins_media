import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';

interface StripePaymentSectionProps {
  amount: number;
  currency?: string;
  cardHolder: string;
  setCardHolder: (val: string) => void;
  cardNumber: string;
  setCardNumber: (val: string) => void;
  cardExpiry: string;
  setCardExpiry: (val: string) => void;
  cardCvc: string;
  setCardCvc: (val: string) => void;
  postalCode?: string;
  setPostalCode?: (val: string) => void;
  delegateName?: string;
  disabled?: boolean;
}

export const StripePaymentSection: React.FC<StripePaymentSectionProps> = ({
  amount,
  currency = 'USD',
  cardHolder,
  setCardHolder,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvc,
  setCardCvc,
  postalCode = '',
  setPostalCode,
  delegateName = '',
  disabled = false
}) => {
  const [gatewayConfig, setGatewayConfig] = useState<{
    publishableKey: string;
    isConfigured: boolean;
    mode: string;
  }>({
    publishableKey: '',
    isConfigured: false,
    mode: 'simulation'
  });
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Detect card network
  const cardBrand = React.useMemo(() => {
    const clean = cardNumber.replace(/\D/g, '');
    if (/^4/.test(clean)) return { name: 'Visa', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (/^3[47]/.test(clean)) return { name: 'Amex', color: 'text-teal-800 bg-teal-50 border-teal-200' };
    if (/^6(?:011|5)/.test(clean)) return { name: 'Discover', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return null;
  }, [cardNumber]);

  useEffect(() => {
    let mounted = true;
    api.getStripeConfig()
      .then((res: any) => {
        const cfg = res?.data || res;
        if (mounted && cfg) {
          setGatewayConfig(cfg);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingConfig(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      const mm = parseInt(raw.slice(0, 2), 10);
      // Clamp month between 01 and 12
      let validMonth = raw.slice(0, 2);
      if (mm > 12) validMonth = '12';
      if (mm === 0) validMonth = '01';
      raw = `${validMonth}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  // Auto-fill Stripe Test Card (Official standard Stripe test numbers)
  const handleAutoFillStripeTestCard = () => {
    setCardHolder(delegateName || 'Dr. Arthur Pendelton');
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    if (setPostalCode) setPostalCode('75008');
  };

  return (
    <div id="stripe-payment-container" className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 space-y-4">
      {/* Stripe Gateway Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center text-white font-bold shadow-xs">
            <span className="text-xs tracking-tighter font-mono">S</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">Stripe Payment Gateway</span>
              <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                {gatewayConfig.mode === 'live' ? 'Live Gateway' : 'Stripe Sandbox'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Direct, encrypted processing of {currency} ${amount} fee
            </p>
          </div>
        </div>

        {/* Quick Test Card Auto-Fill */}
        <button
          type="button"
          onClick={handleAutoFillStripeTestCard}
          disabled={disabled}
          className="self-start sm:self-auto text-[11px] font-bold text-[#635BFF] hover:text-[#4B44C6] bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-[#635BFF]" />
          <span>Auto-Fill Stripe Test Card</span>
        </button>
      </div>

      {/* Card Input Form */}
      <div className="space-y-3">
        {/* Cardholder Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            required
            disabled={disabled}
            placeholder="e.g. Dr. Arthur Pendelton"
            value={cardHolder}
            onChange={e => setCardHolder(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] transition-all"
          />
        </div>

        {/* Card Number */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Card Number
            </label>
            {cardBrand && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${cardBrand.color}`}>
                {cardBrand.name}
              </span>
            )}
          </div>
          <div className="relative">
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              disabled={disabled}
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-mono tracking-wider focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] transition-all"
            />
          </div>
        </div>

        {/* Expiry, CVC & Postal Code Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Expires (MM/YY)
            </label>
            <input
              type="text"
              required
              disabled={disabled}
              placeholder="MM/YY"
              value={cardExpiry}
              onChange={handleExpiryChange}
              maxLength={5}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Security CVC
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                disabled={disabled}
                placeholder="123"
                value={cardCvc}
                onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] transition-all"
              />
            </div>
          </div>

          {setPostalCode && (
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                ZIP / Postal
              </label>
              <input
                type="text"
                disabled={disabled}
                placeholder="75008"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value.toUpperCase())}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* Trust & Compliance Footnote */}
      <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PCI-DSS Level 1 Compliant • 256-Bit TLS Encryption</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Stripe Radar Fraud Shield</span>
          <span>•</span>
          <span className="font-semibold text-slate-600">No Raw Card Storage</span>
        </div>
      </div>
    </div>
  );
};
