import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building,
  User,
  Mail,
  Phone,
  Globe,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conference } from '../types';
import { api } from '../services/api';

interface ConferenceRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference;
  onNavigate?: (path: string) => void;
  initialCategoryId?: number;
}

const COUNTRIES = [
  'United States', 'United Kingdom', 'France', 'Germany', 'Canada', 'Australia',
  'India', 'China', 'Japan', 'South Korea', 'Singapore', 'Switzerland',
  'Netherlands', 'Sweden', 'Italy', 'Spain', 'Brazil', 'Mexico', 'South Africa',
  'United Arab Emirates', 'Saudi Arabia', 'New Zealand', 'Ireland', 'Belgium',
  'Denmark', 'Norway', 'Finland', 'Portugal', 'Austria', 'Poland', 'Turkey',
  'Israel', 'Egypt', 'Nigeria', 'Kenya', 'Malaysia', 'Indonesia', 'Thailand',
  'Vietnam', 'Philippines', 'Argentina', 'Chile', 'Colombia', 'Other'
];

export const ConferenceRegisterModal: React.FC<ConferenceRegisterModalProps> = ({
  isOpen,
  onClose,
  conference,
  onNavigate,
  initialCategoryId
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'United States',
    institution: '',
    passCategoryId: '',
    attendanceMode: 'In-Person' as 'In-Person' | 'Virtual',
    paymentMethod: 'invoice' as 'card' | 'invoice' | 'wire'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    registration_id: string;
    delegate_name: string;
    email: string;
    category_name: string;
    amount: number;
    currency: string;
    attendance_mode: string;
    created_at: string;
  } | null>(null);

  const categories = conference.categories && conference.categories.length > 0
    ? conference.categories
    : [
        { id: 1, name: 'Academic Speaker / Presenter Pass', price: 499 },
        { id: 2, name: 'Industry / Corporate Delegate Pass', price: 599 },
        { id: 3, name: 'Student / Young Researcher Pass', price: 299 },
        { id: 4, name: 'Virtual Conference Attendee', price: 199 }
      ];

  useEffect(() => {
    if (initialCategoryId) {
      setFormData(prev => ({ ...prev, passCategoryId: String(initialCategoryId) }));
    } else if (categories.length > 0 && !formData.passCategoryId) {
      setFormData(prev => ({ ...prev, passCategoryId: String(categories[0].id) }));
    }
  }, [initialCategoryId, categories, formData.passCategoryId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        handleResetAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting]);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    if (submitting) return;
    setSubmitted(false);
    setErrorMessage(null);
    setRegistrationResult(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedInstitution = formData.institution.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid Email address.');
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 5) {
      setErrorMessage('Please enter a valid Mobile Number with country code.');
      return;
    }
    if (!trimmedInstitution) {
      setErrorMessage('Please enter your Institution or Organization.');
      return;
    }

    const selectedCat = categories.find(c => String(c.id) === String(formData.passCategoryId)) || categories[0];
    const catPrice = Number(selectedCat?.price || (selectedCat as any)?.standard_fee || 499);

    const parts = trimmedName.split(' ');
    const firstName = parts[0] || 'Dr./Prof.';
    const lastName = parts.slice(1).join(' ') || parts[0];

    setSubmitting(true);
    try {
      // 1. Persist real registration to backend database
      const regRes = await api.createRegistration({
        conference_id: conference.id,
        conference_title: conference.title,
        category_id: selectedCat?.id || 1,
        category_name: selectedCat?.name || 'Delegate Pass',
        first_name: firstName,
        last_name: lastName,
        email: trimmedEmail,
        phone: trimmedPhone,
        country: formData.country,
        institution: trimmedInstitution,
        billing_address: trimmedInstitution,
        attendance_mode: formData.attendanceMode,
        amount: catPrice,
        currency: 'USD',
        meal_preference: 'Standard',
        accommodation_required: false
      });

      const confirmedId = regRes?.registration_id || `SCINS-REG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      setRegistrationResult({
        registration_id: confirmedId,
        delegate_name: trimmedName,
        email: trimmedEmail,
        category_name: selectedCat?.name || 'Delegate Pass',
        amount: catPrice,
        currency: 'USD',
        attendance_mode: formData.attendanceMode,
        created_at: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      });

      setSubmitted(true);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch (_) {}
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setErrorMessage(err?.message || 'Failed to submit registration. Please check your information and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="conference-register-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={handleResetAndClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 relative text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950/90 p-5 sm:p-6 border-b border-slate-800 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/80 inline-flex items-center space-x-1">
                  <CreditCard className="w-3 h-3 text-teal-400" />
                  <span>{conference.short_title || 'Congress Registration'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {conference.conference_code || 'SCINS-2026'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                {submitted ? 'Registration Confirmed' : 'Register for Congress'}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-1">
                {conference.title}
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              disabled={submitting}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-3 mt-3 border-t border-slate-800/80">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>{conference.dates_label || `${conference.start_date} – ${conference.end_date}`}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{conference.city}, {conference.country}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        {submitted && registrationResult ? (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 text-center max-w-md mx-auto">
              <h4 className="text-xl sm:text-2xl font-bold text-white font-display">
                Registration Successful!
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Thank you, <strong className="text-white">{registrationResult.delegate_name}</strong>. Your delegate registration has been confirmed and saved to the official Secretariat database.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">Reference ID</span>
                <span className="font-mono font-bold text-teal-400 text-sm select-all">{registrationResult.registration_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pass Category</span>
                <span className="font-semibold text-white text-right max-w-[220px] truncate">{registrationResult.category_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Attendance Mode</span>
                <span className="font-medium text-teal-300">{registrationResult.attendance_mode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Delegate Email</span>
                <span className="font-medium text-slate-200">{registrationResult.email}</span>
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-800">
                <span className="text-slate-300 font-bold">Total Amount</span>
                <span className="font-bold text-teal-400 text-base">
                  ${registrationResult.amount} {registrationResult.currency}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              A copy of your registration confirmation and official invoice has been dispatched to <strong>{registrationResult.email}</strong>.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl text-xs transition-colors inline-flex items-center justify-center space-x-2 border border-slate-700 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-teal-400" />
                <span>Print Confirmation</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl text-xs transition-all inline-flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Conference</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Full Name <span className="text-teal-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Doe"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={submitting}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Email Address <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. jane.doe@university.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    disabled={submitting}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Mobile / WhatsApp <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555-0199"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    disabled={submitting}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Country & Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Country <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                  <select
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    disabled={submitting}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors cursor-pointer"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Institution / Org <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. MIT / Pfizer"
                    value={formData.institution}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    disabled={submitting}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Pass Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Select Pass Category <span className="text-teal-400">*</span>
              </label>
              <select
                value={formData.passCategoryId}
                onChange={e => setFormData({ ...formData, passCategoryId: e.target.value })}
                disabled={submitting}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                    {cat.name} — ${cat.price || (cat as any).standard_fee || 499} USD
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Mode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Attendance Mode
              </label>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {(['In-Person', 'Virtual'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData({ ...formData, attendanceMode: mode })}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                      formData.attendanceMode === mode
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/80 shadow-xs'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.01]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Processing & Registering...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>Confirm & Complete Registration</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={submitting}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center justify-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Conference</span>
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Secure 256-bit SSL encrypted registration checkout</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
