import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Phone,
  Mail,
  User,
  Globe,
  MessageSquare,
  ArrowLeft,
  Calendar,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conference } from '../types';
import { api } from '../services/api';

interface BrochureEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference;
  onSuccessDownload?: () => void;
}

const COUNTRIES = [
  'United States', 'United Kingdom', 'India', 'Canada', 'Australia', 'Germany',
  'France', 'Switzerland', 'Japan', 'South Korea', 'Singapore', 'United Arab Emirates',
  'Saudi Arabia', 'China', 'Netherlands', 'Sweden', 'Italy', 'Spain', 'Brazil',
  'Mexico', 'South Africa', 'New Zealand', 'Ireland', 'Belgium', 'Denmark',
  'Norway', 'Finland', 'Portugal', 'Austria', 'Poland', 'Turkey', 'Malaysia',
  'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'Egypt', 'Nigeria', 'Kenya',
  'Argentina', 'Chile', 'Colombia', 'Other'
];

export const BrochureEnquiryModal: React.FC<BrochureEnquiryModalProps> = ({
  isOpen,
  onClose,
  conference,
  onSuccessDownload
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    country: 'United States',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const triggerFileDownload = (brochureUrl?: string) => {
    const url = brochureUrl || conference.flyer_url || '/uploads/brochure_pdf-1791699467728-2254.pdf' || `/api/v1/conferences/${conference.slug}/brochure/download`;
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${conference.slug || 'conference'}-official-brochure.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Direct file download fallback:', e);
      window.open(url, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.mobileNumber.trim();
    const trimmedCountry = formData.country.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Please provide a valid Email address.');
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 5) {
      setErrorMessage('Please provide a valid Mobile Number with country code.');
      return;
    }
    if (!trimmedCountry) {
      setErrorMessage('Please select your Country.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit enquiry to backend database
      const res = await api.submitBrochureEnquiry({
        conference_id: conference.id,
        conference_name: conference.title,
        full_name: trimmedName,
        email: trimmedEmail,
        mobile_number: trimmedPhone,
        country: trimmedCountry,
        query_message: trimmedMessage || `Brochure download requested for ${conference.title}`
      });

      // 2. Trigger celebration & direct download
      setSuccess(true);
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (_) {}

      // 3. Initiate the conference brochure download
      setTimeout(() => {
        triggerFileDownload(res.brochure_url || conference.flyer_url);
        if (onSuccessDownload) onSuccessDownload();
      }, 500);

    } catch (err: any) {
      console.error('Enquiry submission error:', err);
      setErrorMessage(err?.message || 'Failed to submit brochure enquiry. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    if (submitting) return;
    setSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      id="brochure-enquiry-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={handleResetAndClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden my-6 sm:my-8 animate-in fade-in zoom-in-95 duration-150 relative text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white p-5 sm:p-6 border-b border-slate-200 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0 pr-2">
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                Download Conference Brochure
              </h3>
              <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                {conference.title}
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              disabled={submitting}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 mt-3 border-t border-slate-100">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0E7490]" />
              <span>{conference.dates_label || `${conference.start_date} – ${conference.end_date}`}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0E7490]" />
              <span>{conference.city}, {conference.country}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-5 bg-white">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0E7490] shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                Brochure Download Started!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Thank you, <strong className="text-slate-900">{formData.fullName}</strong>. Your enquiry has been recorded in our official Secretariat database. Your brochure PDF is downloading automatically.
              </p>
            </div>

            <div className="pt-2 flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => triggerFileDownload()}
                className="px-6 py-3 bg-[#0A2540] hover:bg-[#0E7490] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all inline-flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Again</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Conference</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 max-h-[75vh] overflow-y-auto bg-white">
            <p className="text-xs text-slate-600 leading-relaxed">
              Please enter your contact details below to download the official conference brochure, scientific syllabus, and program guide.
            </p>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Robert Vance"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={submitting}
                  className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-all"
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. robert@univ.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    disabled={submitting}
                    className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555-0199"
                    value={formData.mobileNumber}
                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                    disabled={submitting}
                    className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Country <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <select
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  disabled={submitting}
                  className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-all cursor-pointer"
                >
                  {COUNTRIES.map(c => (
                    <option key={c} value={c} className="bg-white text-slate-900">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Query / Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Query / Note <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  placeholder="Specify any special session interest, group discounts, or queries..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  disabled={submitting}
                  className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-[#0A2540] hover:bg-[#0E7490] disabled:opacity-60 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.005]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-white" />
                    <span>Verifying & Downloading Brochure...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Submit & Download Brochure</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={submitting}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center justify-center space-x-1 cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Conference</span>
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E7490]" />
              <span>Brochure is provided directly by the official Scientific Secretariat</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
