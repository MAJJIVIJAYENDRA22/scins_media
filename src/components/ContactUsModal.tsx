import React, { useState } from 'react';
import {
  X,
  Mail,
  User,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Kept as optional for backwards compatibility
  conference?: any;
  conferences?: any;
}

const COUNTRY_DIAL_CODES = [
  { country: 'United States', code: 'US', dial: '+1' },
  { country: 'United Kingdom', code: 'GB', dial: '+44' },
  { country: 'Canada', code: 'CA', dial: '+1' },
  { country: 'Australia', code: 'AU', dial: '+61' },
  { country: 'Germany', code: 'DE', dial: '+49' },
  { country: 'France', code: 'FR', dial: '+33' },
  { country: 'India', code: 'IN', dial: '+91' },
  { country: 'Japan', code: 'JP', dial: '+81' },
  { country: 'China', code: 'CN', dial: '+86' },
  { country: 'South Korea', code: 'KR', dial: '+82' },
  { country: 'Singapore', code: 'SG', dial: '+65' },
  { country: 'Switzerland', code: 'CH', dial: '+41' },
  { country: 'Netherlands', code: 'NL', dial: '+31' },
  { country: 'Sweden', code: 'SE', dial: '+46' },
  { country: 'Italy', code: 'IT', dial: '+39' },
  { country: 'Spain', code: 'ES', dial: '+34' },
  { country: 'Brazil', code: 'BR', dial: '+55' },
  { country: 'Mexico', code: 'MX', dial: '+52' },
  { country: 'South Africa', code: 'ZA', dial: '+27' },
  { country: 'United Arab Emirates', code: 'AE', dial: '+971' },
  { country: 'Saudi Arabia', code: 'SA', dial: '+966' },
  { country: 'New Zealand', code: 'NZ', dial: '+64' },
  { country: 'Ireland', code: 'IE', dial: '+353' },
  { country: 'Belgium', code: 'BE', dial: '+32' },
  { country: 'Denmark', code: 'DK', dial: '+45' },
  { country: 'Norway', code: 'NO', dial: '+47' },
  { country: 'Finland', code: 'FI', dial: '+358' },
  { country: 'Portugal', code: 'PT', dial: '+351' },
  { country: 'Austria', code: 'AT', dial: '+43' },
  { country: 'Poland', code: 'PL', dial: '+48' },
  { country: 'Turkey', code: 'TR', dial: '+90' },
  { country: 'Israel', code: 'IL', dial: '+972' },
  { country: 'Egypt', code: 'EG', dial: '+20' },
  { country: 'Nigeria', code: 'NG', dial: '+234' },
  { country: 'Kenya', code: 'KE', dial: '+254' },
  { country: 'Malaysia', code: 'MY', dial: '+60' },
  { country: 'Indonesia', code: 'ID', dial: '+62' },
  { country: 'Thailand', code: 'TH', dial: '+66' },
  { country: 'Vietnam', code: 'VN', dial: '+84' },
  { country: 'Philippines', code: 'PH', dial: '+63' },
  { country: 'Argentina', code: 'AR', dial: '+54' },
  { country: 'Chile', code: 'CL', dial: '+56' },
  { country: 'Colombia', code: 'CO', dial: '+57' },
  { country: 'Russia', code: 'RU', dial: '+7' },
  { country: 'Other', code: 'OT', dial: '+1' }
];

export const ContactUsModal: React.FC<ContactUsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country_code: '+1',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setSubmitted(false);
    setError(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      country_code: '+1',
      message: ''
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please provide your contact number.');
      return;
    }

    setSubmitting(true);
    const fullPhone = `${formData.country_code} ${formData.phone.trim()}`.trim();

    try {
      await api.submitContact({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: fullPhone,
        message: formData.message.trim(),
        subject: 'General Inquiry / Website Contact'
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('[Contact Submission Error]:', err);
      setError(err?.message || 'Failed to submit enquiry. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="contact-us-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                <Mail className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                Get In Touch
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display mt-0.5">
              Contact Us
            </h3>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 sm:p-10 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xl font-bold text-slate-900 font-display">
                Enquiry Submitted Successfully
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-800">{formData.name}</strong>. Your message has been received by our team. We will get back to you shortly.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Full Name * */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 transition-colors"
                />
              </div>
            </div>

            {/* 2. Contact Number * */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex">
                <select
                  aria-label="Country Dial Code"
                  value={formData.country_code}
                  onChange={e => setFormData({ ...formData, country_code: e.target.value })}
                  className="w-28 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl px-2 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
                  title="Country Code"
                >
                  {COUNTRY_DIAL_CODES.map(c => (
                    <option key={c.country + c.dial} value={c.dial}>
                      {c.code} ({c.dial})
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 555-123-4567"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-r-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Email ID * */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="e.g. j.smith@university.edu"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 transition-colors"
                />
              </div>
            </div>

            {/* 4. Query / Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Query / Message
              </label>
              <div className="relative">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <textarea
                  rows={4}
                  placeholder="Please enter your query or message..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Encrypted & secure submission</span>
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Query</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
