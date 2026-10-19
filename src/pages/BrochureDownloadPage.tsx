import React, { useState } from 'react';
import {
  Download,
  Calendar,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Send,
  User,
  Mail,
  Phone,
  Globe,
  MessageSquare,
  Loader2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conference } from '../types';
import { api } from '../services/api';

interface BrochureDownloadPageProps {
  conference: Conference;
  onNavigate: (path: string) => void;
}

const COUNTRIES = [
  'United States (+1)', 'United Kingdom (+44)', 'India (+91)', 'Canada (+1)',
  'Australia (+61)', 'Germany (+49)', 'France (+33)', 'Switzerland (+41)',
  'Japan (+81)', 'South Korea (+82)', 'Singapore (+65)', 'United Arab Emirates (+971)',
  'Saudi Arabia (+966)', 'China (+86)', 'Netherlands (+31)', 'Sweden (+46)',
  'Italy (+39)', 'Spain (+34)', 'Brazil (+55)', 'Mexico (+52)', 'South Africa (+27)',
  'New Zealand (+64)', 'Ireland (+353)', 'Belgium (+32)', 'Denmark (+45)',
  'Norway (+47)', 'Finland (+358)', 'Portugal (+351)', 'Austria (+43)',
  'Poland (+48)', 'Turkey (+90)', 'Malaysia (+60)', 'Indonesia (+62)',
  'Thailand (+66)', 'Vietnam (+84)', 'Philippines (+63)', 'Egypt (+20)',
  'Nigeria (+234)', 'Kenya (+254)', 'Argentina (+54)', 'Chile (+56)',
  'Colombia (+57)', 'Other'
];

export const BrochureDownloadPage: React.FC<BrochureDownloadPageProps> = ({
  conference,
  onNavigate
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    country: 'United States (+1)',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const triggerFileDownload = (brochureUrl?: string) => {
    // Correct brochure configured in admin panel: conference.flyer_url, or returned by backend, or server fallback
    const targetUrl = brochureUrl || conference.flyer_url || '/uploads/brochure_pdf-1791699467728-2254.pdf' || `/api/v1/conferences/${conference.slug}/brochure/download`;
    try {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.setAttribute('download', `${conference.slug || 'conference'}-official-brochure.pdf`);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('[Direct Download Notice]:', e);
      window.open(targetUrl, '_blank');
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
      setErrorMessage('Please provide a valid Email / Gmail address.');
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
    if (!trimmedMessage) {
      setErrorMessage('Please enter your Query or Message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitBrochureEnquiry({
        conference_id: conference.id,
        conference_name: conference.title,
        full_name: trimmedName,
        email: trimmedEmail,
        mobile_number: trimmedPhone,
        country: trimmedCountry,
        query_message: trimmedMessage
      });

      setSubmitted(true);
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (_) {}

      // Automatically initiate brochure download without requiring any extra click or preview
      const downloadPath = res.brochure_url || conference.flyer_url;
      setTimeout(() => {
        triggerFileDownload(downloadPath);
      }, 400);

    } catch (err: any) {
      console.error('Enquiry submission error:', err);
      setErrorMessage(err.message || 'Unable to record enquiry. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-8 sm:pt-12 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <button
            type="button"
            onClick={() => onNavigate(`/conferences/${conference.slug}`)}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {conference.short_title || conference.title}</span>
          </button>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 text-slate-900 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {conference.domain || 'Scientific Congress'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              {conference.title}
            </h1>

            {conference.theme && (
              <p className="text-xs sm:text-sm text-[#0E7490] font-medium italic">
                "{conference.theme}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
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
        </div>

        {/* Brochure Download Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          {submitted ? (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                  Brochure Download Started!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Thank you, <strong className="text-slate-900">{formData.fullName}</strong>. Your enquiry has been recorded in our official Secretariat database. Your conference brochure PDF is downloading automatically.
                </p>
              </div>

              <div className="pt-2 flex flex-col items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => triggerFileDownload()}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Again</span>
                </button>
                <p className="text-[11px] text-slate-400">
                  If the download didn't start automatically, please click above.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onNavigate(`/conferences/${conference.slug}`)}
                  className="text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors inline-flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Conference Overview</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                  Download Conference Brochure
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Please complete the form below to receive and automatically download the official conference brochure, complete session tracks, keynote schedule, and registration guidelines.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Robert Vance"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={submitting}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email / Gmail ID <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. robert@gmail.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        disabled={submitting}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 555-0199"
                        value={formData.mobileNumber}
                        onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                        disabled={submitting}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                      disabled={submitting}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors cursor-pointer"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Query / Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Query / Message <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      required
                      placeholder="Specify your academic interest (e.g. plenary slots, student discounts, exhibition opportunities)..."
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      disabled={submitting}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying & Preparing Download...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Submit & Download Brochure</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Your contact information is strictly protected and will only be used by the Scientific Secretariat.
                </p>
              </form>
            </div>
          )}
        </div>

        {/* Quick Cross-Navigation Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900">Submit Your Abstract</h4>
              <p className="text-xs text-slate-500">Present your findings to the global delegation</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(`/conferences/${conference.slug}/submit-abstract`)}
              className="px-4 py-2 bg-slate-900 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900">Delegate Registration</h4>
              <p className="text-xs text-slate-500">Secure early-bird conference pass</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(`/conferences/${conference.slug}/register`)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
