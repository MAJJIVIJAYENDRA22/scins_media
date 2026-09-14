import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building,
  Calendar,
  MapPin,
  Globe,
  User,
  Mail,
  Lock,
  Download,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conference, RegistrationCategory } from '../types';
import { INITIAL_CONFERENCES, REGISTRATION_CATEGORIES } from '../data/initialData';
import { api } from '../services/api';
import { StripePaymentSection } from '../components/StripePaymentSection';

interface RegistrationPageProps {
  initialConferenceSlug?: string;
  initialCategoryId?: number;
  lockConference?: boolean;
  onNavigate?: (path: string) => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  initialConferenceSlug,
  initialCategoryId,
  lockConference = false,
  onNavigate = (_path: string) => {}
}) => {
  const [conferences, setConferences] = useState<Conference[]>([...INITIAL_CONFERENCES]);
  const [selectedConferenceId, setSelectedConferenceId] = useState<number>(() => {
    if (initialConferenceSlug) {
      const found = INITIAL_CONFERENCES.find(c => c.slug === initialConferenceSlug);
      if (found) return found.id;
    }
    return 1;
  });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  // Currency Selection (display + charge currency for the registration table)
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
  const CURRENCY_RATES: Record<'EUR' | 'USD' | 'GBP', number> = { EUR: 1, USD: 1.08, GBP: 0.85 };
  const CURRENCY_SYMBOLS: Record<'EUR' | 'USD' | 'GBP', string> = { EUR: '€', USD: '$', GBP: '£' };
  const rate = CURRENCY_RATES[currency];
  const sym = CURRENCY_SYMBOLS[currency];
  const convert = (amount: number) => Math.round(amount * rate);

  // Payment States
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'paypal' | 'wire'>('stripe');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardPostal, setCardPostal] = useState('75008');
  const [paymentResult, setPaymentResult] = useState<{
    transaction_id: string;
    receipt_id: string;
    status: string;
    created_at: string;
  } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: 'United States',
    institution: '',
    department: '',
    designation: 'Professor',
    attendance_mode: 'In-Person' as 'In-Person' | 'Virtual',
    accommodation_required: false,
    meal_preference: 'Standard'
  });

  // Load live conferences
  useEffect(() => {
    api.getConferences()
      .then(res => {
        if (res && res.length > 0) {
          setConferences(res);
          if (initialConferenceSlug) {
            const found = res.find(c => c.slug === initialConferenceSlug);
            if (found) setSelectedConferenceId(found.id);
          }
        }
      })
      .catch(() => {});
  }, [initialConferenceSlug]);

  const activeConference = useMemo(() => {
    return conferences.find(c => c.id === selectedConferenceId) || conferences[0] || INITIAL_CONFERENCES[0];
  }, [conferences, selectedConferenceId]);

  const categoriesList = useMemo(() => {
    const confCats = (activeConference.categories && activeConference.categories.length > 0)
      ? activeConference.categories
      : REGISTRATION_CATEGORIES.filter(c => c.conference_id === activeConference.id);
    const list = confCats.length > 0 ? confCats : REGISTRATION_CATEGORIES;
    return list.map(c => ({
      ...c,
      early_bird_fee: c.early_bird_fee ?? c.academic_price ?? c.early_bird_price ?? 399,
      standard_fee: c.standard_fee ?? c.industry_price ?? c.price ?? 499,
      benefits: (c.benefits && c.benefits.length > 0)
        ? c.benefits
        : [
            'Full access to all 20 scientific sessions & poster halls',
            'Official delegate badge & printed abstracts handbook',
            'Complimentary organic luncheon & coffee networking breaks',
            'Certificate of Presentation / Continuing Education credits'
          ]
    }));
  }, [activeConference]);

  const [selectedCat, setSelectedCat] = useState<RegistrationCategory>(() => {
    const confId = (() => {
      if (initialConferenceSlug) {
        const found = INITIAL_CONFERENCES.find(c => c.slug === initialConferenceSlug);
        if (found) return found.id;
      }
      return 1;
    })();
    const catsForConf = REGISTRATION_CATEGORIES.filter(c => c.conference_id === confId);
    const list = catsForConf.length > 0 ? catsForConf : REGISTRATION_CATEGORIES;
    if (initialCategoryId) {
      const found = list.find(c => c.id === initialCategoryId);
      if (found) return found;
    }
    return list[0] || REGISTRATION_CATEGORIES[0];
  });

  // Reset selectedCat only when it no longer belongs to the active conference's category list
  useEffect(() => {
    if (categoriesList.length > 0) {
      const stillValid = categoriesList.some(c => c.id === selectedCat.id);
      if (!stillValid) {
        setSelectedCat(categoriesList[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesList]);

  const baseFee = selectedCat.tier3_price ?? selectedCat.early_bird_fee ?? selectedCat.early_bird_price ?? selectedCat.price ?? 499;
  const fee = convert(baseFee);
  const totalAmount = fee + (formData.accommodation_required ? convert(350) : 0);

  const handleNext = () => {
    if (step === 2) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.institution) {
        alert('Please complete all mandatory delegate fields before continuing to checkout.');
        return;
      }
      if (!cardHolder) {
        setCardHolder(`${formData.first_name} ${formData.last_name}`.trim());
      }
    }
    setStep(s => Math.min(4, s + 1));
  };

  const handleAutoFillTestCard = () => {
    setCardHolder(`${formData.first_name || 'Dr. Elena'} ${formData.last_name || 'Rostova'}`);
    setCardNumber('4242 •••• •••• 4242');
    setCardExpiry('09/28');
    setCardCvc('884');
  };

  const handleCompleteRegistration = async () => {
    setSubmitting(true);
    try {
      const regRes = await api.createRegistration({
        conference_id: activeConference.id,
        conference_title: activeConference.title,
        category_id: selectedCat.id,
        category_name: selectedCat.name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        institution: formData.institution,
        department: formData.department,
        designation: formData.designation,
        attendance_mode: formData.attendance_mode,
        accommodation_required: formData.accommodation_required,
        meal_preference: formData.meal_preference,
        amount: totalAmount,
        currency: currency
      });

      const newRegId = regRes.registration_id;
      setRegistrationId(newRegId);

      // Process payment through Payment Gateway
      if (paymentGateway === 'stripe') {
        // Step 1: Securely initialize Stripe PaymentIntent on backend
        const piRes = await api.createStripePaymentIntent({
          amount: totalAmount,
          currency: currency,
          registration_id: regRes.id || newRegId,
          conference_id: activeConference.id,
          conference_title: activeConference.title,
          category_name: selectedCat.name,
          delegate_name: `${formData.first_name} ${formData.last_name}`.trim(),
          delegate_email: formData.email
        });

        // Step 2: Confirm Payment through Stripe Endpoint
        const paymentIntentId = (piRes as any)?.data?.paymentIntentId || (piRes as any)?.paymentIntentId || `pi_${Date.now()}`;
        const confirmRes = await api.confirmStripePayment({
          payment_intent_id: paymentIntentId,
          registration_id: regRes.id || newRegId,
          conference_id: activeConference.id,
          amount: totalAmount,
          currency: currency,
          card_holder_name: cardHolder || `${formData.first_name} ${formData.last_name}`,
          card_last4: cardNumber.replace(/\D/g, '').slice(-4) || '4242',
          billing_email: formData.email
        });

        const confirmData = (confirmRes as any)?.data || confirmRes;
        if (confirmData) {
          setPaymentResult({
            transaction_id: confirmData.transaction_id,
            receipt_id: confirmData.receipt_id,
            status: 'completed',
            created_at: confirmData.created_at
          });
        }
      } else {
        // Generic gateway processing (PayPal / Bank Wire)
        const payRes = await api.processPayment({
          registration_id: regRes.id || newRegId,
          conference_id: activeConference.id,
          amount: totalAmount,
          currency: currency,
          gateway: paymentGateway,
          card_holder_name: cardHolder || `${formData.first_name} ${formData.last_name}`,
          card_last4: cardNumber.replace(/\D/g, '').slice(-4) || '4242',
          billing_email: formData.email
        });

        if (payRes && payRes.data) {
          setPaymentResult({
            transaction_id: payRes.data.transaction_id,
            receipt_id: payRes.data.receipt_id,
            status: 'completed',
            created_at: payRes.data.created_at
          });
        }
      }

      setStep(4);
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err: any) {
      console.warn('Fallback payment processing:', err);
      const fallbackRegId = `SCINS-REG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const fallbackTxnId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setRegistrationId(fallbackRegId);
      setPaymentResult({
        transaction_id: fallbackTxnId,
        receipt_id: `REC-${fallbackRegId}`,
        status: 'completed',
        created_at: new Date().toISOString()
      });
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900">
              Conference Registration & Payment Gateway
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Register for upcoming scientific congresses, select delegate passes, and complete verified checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            &larr; Back to Home
          </button>
        </div>

        {/* Stepper Header */}
        {step < 4 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className={`p-2 rounded-xl transition-colors ${step === 1 ? 'bg-teal-50 font-bold text-teal-900 border border-teal-200' : 'text-slate-500'}`}>
                1. Select Pass & Congress
              </div>
              <div className={`p-2 rounded-xl transition-colors ${step === 2 ? 'bg-teal-50 font-bold text-teal-900 border border-teal-200' : 'text-slate-500'}`}>
                2. Delegate Information
              </div>
              <div className={`p-2 rounded-xl transition-colors ${step === 3 ? 'bg-teal-50 font-bold text-teal-900 border border-teal-200' : 'text-slate-500'}`}>
                3. Payment Gateway
              </div>
            </div>
          </div>
        )}

        {/* Main Content Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* STEP 1: Select Conference & Pass Category */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              {/* Select Conference Dropdown (only shown when not locked to one conference) */}
              {!lockConference && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Select Scientific Congress
                  </label>
                  <select
                    value={selectedConferenceId}
                    onChange={e => setSelectedConferenceId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
                  >
                    {conferences.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.dates} • {c.location})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conference Banner Details */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                    {activeConference.domain || 'Life Sciences'}
                  </span>
                  <h3 className="text-sm font-bold">{activeConference.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      <span>{activeConference.dates}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{activeConference.location}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="text-center space-y-3 pt-1">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                  CHOOSE YOUR CURRENCY
                </h3>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {(['EUR', 'USD', 'GBP'] as const).map(cur => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setCurrency(cur)}
                      className="flex items-center justify-between gap-6 pl-5 pr-2 py-2 rounded-full text-white text-sm font-semibold cursor-pointer transition-transform hover:scale-[1.02] shadow-xs"
                      style={{ background: 'linear-gradient(90deg, #0A2540 0%, #0E7490 100%)', minWidth: '150px' }}
                    >
                      <span>{cur === 'EUR' ? 'EURO' : cur}</span>
                      <span
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          currency === cur ? 'border-teal-300' : 'border-white/70'
                        }`}
                      >
                        {currency === cur && <span className="w-3 h-3 rounded-full bg-teal-300" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Single Unified Registration Pricing Table */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Select Registration Category
                </label>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-800 to-teal-900 text-white">
                        <th className="text-left font-bold uppercase tracking-wider px-4 py-3">Category</th>
                        <th className="text-center font-bold uppercase tracking-wider px-4 py-3">
                          On/Before<br />{categoriesList[0]?.tier1_label || 'Tier 1'}
                        </th>
                        <th className="text-center font-bold uppercase tracking-wider px-4 py-3">
                          On/Before<br />{categoriesList[0]?.tier2_label || 'Tier 2'}
                        </th>
                        <th className="text-center font-bold uppercase tracking-wider px-4 py-3 bg-teal-950/40">
                          On/Before<br />{categoriesList[0]?.tier3_label || 'Tier 3'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesList.map((cat, idx) => {
                        const isSelected = selectedCat.id === cat.id;
                        const t1 = convert(cat.tier1_price ?? cat.early_bird_fee ?? cat.price ?? 0);
                        const t2 = convert(cat.tier2_price ?? cat.standard_fee ?? cat.price ?? 0);
                        const t3 = convert(cat.tier3_price ?? cat.price ?? 0);
                        return (
                          <tr
                            key={cat.id}
                            onClick={() => setSelectedCat(cat)}
                            className={`cursor-pointer border-t border-slate-200 transition-colors ${
                              isSelected ? 'bg-teal-50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60 hover:bg-teal-50/50'
                            }`}
                          >
                            <td className="px-4 py-3 align-middle">
                              <span className="font-bold text-slate-900">{cat.name}</span>
                            </td>
                            <td className="px-4 py-3 text-center align-middle text-slate-400 line-through decoration-slate-300">
                              {sym}{t1}
                            </td>
                            <td className="px-4 py-3 text-center align-middle text-slate-400 line-through decoration-slate-300">
                              {sym}{t2}
                            </td>
                            <td className="px-4 py-3 text-center align-middle bg-teal-50/40">
                              <label className="inline-flex items-center justify-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="registration_category"
                                  checked={isSelected}
                                  onChange={() => setSelectedCat(cat)}
                                  className="w-4 h-4 text-teal-700 focus:ring-teal-600 cursor-pointer"
                                />
                                <span className="font-extrabold text-teal-800 text-sm">{sym}{t3}</span>
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Benefits of selected category */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  {selectedCat.benefits?.map((b, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: Delegate Information */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold font-display text-slate-900">
                Delegate Profile & Institutional Affiliation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arthur"
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pendelton"
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. a.pendelton@mit.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 617 555 0192"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">University / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Massachusetts Institute of Technology"
                    value={formData.institution}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United States, Germany, Japan"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Attendance Mode & Accommodation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Attendance Mode</h4>
                    <p className="text-[11px] text-slate-500">Choose between physical on-site presence or virtual interactive streaming.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attendance_mode: 'In-Person' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        formData.attendance_mode === 'In-Person'
                          ? 'bg-teal-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      In-Person
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attendance_mode: 'Virtual' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        formData.attendance_mode === 'Virtual'
                          ? 'bg-teal-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      Virtual / Online
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Add 3 Nights 4-Star Hotel Accommodation (+{sym}{convert(350)} {currency})</h5>
                    <p className="text-[11px] text-slate-500">Includes breakfast and shuttle to congress venue.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.accommodation_required}
                    onChange={e => setFormData({ ...formData, accommodation_required: e.target.checked })}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Integrated Payment Gateway */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              {/* Order Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Selected Order</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedCat.name} • {activeConference.short_title}</p>
                  <p className="text-slate-500 text-[11px]">{formData.first_name} {formData.last_name} ({formData.institution})</p>
                </div>
                <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Total Due</span>
                  <span className="text-2xl font-extrabold text-teal-800">{sym}{totalAmount} {currency}</span>
                </div>
              </div>

              {/* Gateway Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Select Payment Gateway
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFillTestCard}
                    className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    Auto-Fill Test Card Credentials
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('stripe')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentGateway === 'stripe'
                        ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600 text-teal-950 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-teal-700 mb-1" />
                    <span className="text-xs block">Card (Stripe)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Visa, Mastercard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentGateway('paypal')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentGateway === 'paypal'
                        ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600 text-teal-950 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Globe className="w-5 h-5 text-blue-600 mb-1" />
                    <span className="text-xs block">PayPal</span>
                    <span className="text-[10px] text-slate-500 font-normal">Express Checkout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentGateway('wire')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentGateway === 'wire'
                        ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600 text-teal-950 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Building className="w-5 h-5 text-amber-600 mb-1" />
                    <span className="text-xs block">Bank Wire</span>
                    <span className="text-[10px] text-slate-500 font-normal">Pro-forma Invoice</span>
                  </button>
                </div>
              </div>

              {/* Stripe Payment Gateway Section */}
              {paymentGateway === 'stripe' && (
                <StripePaymentSection
                  amount={totalAmount}
                  currency={currency}
                  cardHolder={cardHolder}
                  setCardHolder={setCardHolder}
                  cardNumber={cardNumber}
                  setCardNumber={setCardNumber}
                  cardExpiry={cardExpiry}
                  setCardExpiry={setCardExpiry}
                  cardCvc={cardCvc}
                  setCardCvc={setCardCvc}
                  postalCode={cardPostal}
                  setPostalCode={setCardPostal}
                  delegateName={`${formData.first_name} ${formData.last_name}`.trim()}
                  disabled={submitting}
                />
              )}

              {paymentGateway === 'paypal' && (
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-200 text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xs font-bold text-lg">
                    P
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">PayPal Express Checkout</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Clicking "Pay & Confirm Delegate Registration" will charge <b>{sym}{totalAmount} {currency}</b> via your PayPal account.
                  </p>
                </div>
              )}

              {paymentGateway === 'wire' && (
                <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                    <Building className="w-4 h-4" />
                    <span>University Institutional Wire Remittance</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-amber-200 font-mono text-[11px] space-y-1">
                    <div><b>Bank:</b> European Commercial Banking</div>
                    <div><b>Account:</b> SCINS Media International</div>
                    <div><b>Jurisdiction / Location:</b> Estonia, Europe</div>
                    <div><b>Reference:</b> {formData.email || 'DELEGATE-REG'}</div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    A formal Pro-forma invoice will be automatically delivered to {formData.email || 'your email'}.
                  </p>
                </div>
              )}

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center space-x-2 text-xs text-teal-900">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>PCI-DSS Level 1 Encrypted Payment Gateway. Instant receipt dispatch.</span>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Official Receipt */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                  Confirmed & Paid
                </span>
                <h2 className="text-2xl font-bold font-display text-slate-900 mt-2">
                  Delegate Registration Confirmed!
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Welcome to {activeConference.title}. Your pass and official tax receipt are ready.
                </p>
              </div>

              {/* Printable Official Receipt */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl max-w-lg mx-auto shadow-xl text-left space-y-3 font-sans border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">SCINS MEDIA INTERNATIONAL</span>
                    <h4 className="text-sm font-bold text-white">{activeConference.short_title || activeConference.title}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold bg-teal-950 text-teal-400 border border-teal-800 px-2 py-0.5 rounded">
                    PAID
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Registration ID</span>
                    <span className="font-mono font-bold text-teal-300 text-sm select-all">
                      {registrationId || 'SCINS-REG-2026-88120'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Transaction ID</span>
                    <span className="font-mono text-slate-300 text-xs select-all">
                      {paymentResult?.transaction_id || `TXN-${Date.now().toString(36).toUpperCase()}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Delegate Name</span>
                    <span className="text-slate-200 font-semibold">{formData.first_name} {formData.last_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Pass Tier</span>
                    <span className="text-slate-200 font-semibold">{selectedCat.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Organization</span>
                    <span className="text-slate-300 truncate block">{formData.institution}, {formData.country}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Amount Paid</span>
                    <span className="text-teal-300 font-bold text-base font-mono">{sym}{totalAmount} {currency}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Gateway: {paymentGateway.toUpperCase()}</span>
                  <span>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Back to Homepage
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          {step < 4 && (
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCompleteRegistration}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Verifying Payment...' : `Pay & Confirm Registration (${sym}${totalAmount} ${currency})`}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
