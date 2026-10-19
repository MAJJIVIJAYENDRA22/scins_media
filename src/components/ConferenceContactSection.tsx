import React, { useState } from 'react';
import {
  Mail,
  User,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import { Conference } from '../types';
import { api } from '../services/api';

interface ConferenceContactSectionProps {
  conference: Conference;
}

const COUNTRY_DIAL_CODES = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'IN' },
  { code: '+61', country: 'AU' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+81', country: 'JP' },
  { code: '+86', country: 'CN' },
  { code: '+65', country: 'SG' },
  { code: '+971', country: 'UAE' },
  { code: '+41', country: 'CH' },
  { code: '+31', country: 'NL' },
  { code: '+46', country: 'SE' },
  { code: '+82', country: 'KR' },
  { code: '+55', country: 'BR' },
  { code: '+27', country: 'ZA' },
  { code: '+34', country: 'ES' },
  { code: '+39', country: 'IT' },
  { code: '+60', country: 'MY' },
  { code: '+64', country: 'NZ' },
  { code: '+966', country: 'SA' },
];

export const ConferenceContactSection: React.FC<ConferenceContactSectionProps> = ({ conference }) => {
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedRefId, setSubmittedRefId] = useState<number | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email ID is required';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    if (!phone.trim()) {
      errs.phone = 'Contact Number is required';
    } else if (phone.trim().replace(/\D/g, '').length < 6) {
      errs.phone = 'Please provide a valid contact number (at least 6 digits)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const fullPhoneNumber = `${countryCode} ${phone.trim()}`;
      const payload = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: fullPhoneNumber,
        subject: `Enquiry: ${conference.short_title || conference.title}`,
        message: message.trim(),
        conference_id: conference.id
      };

      const res = await api.submitContact(payload);
      setSubmittedRefId(res?.id || Date.now());
      setFullName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setErrors({});
    } catch (err: any) {
      console.error('Contact enquiry submission failed:', err);
      setServerError(
        err?.message ||
        'Failed to submit your enquiry. Please verify the entered details and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRefId(null);
    setServerError(null);
    setErrors({});
  };

  return (
    <section id="contact-section" className="scroll-mt-20 py-16 lg:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Context & Conference Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Secretariat & Inquiries</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 font-display tracking-tight">
                {conference.secretariat_section_title || 'Contact Congress Secretariat'}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {conference.secretariat_section_description || 'Have questions regarding registration, abstract acceptance, visa invitation letters, or exhibition opportunities? Submit your inquiry directly to the organizing committee.'}
              </p>
            </div>

            {/* Conference Card Context */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                {conference.secretariat_association_title || 'Conference Association'}
              </div>
              <div className="font-bold text-slate-900 text-base leading-snug">
                {conference.secretariat_conference_name || conference.title}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">{conference.secretariat_dates || conference.start_date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">
                    {conference.secretariat_location || (conference.city && conference.country ? `${conference.city}, ${conference.country}` : conference.city || conference.country || '')}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Contact Channels */}
            <div className="p-5 rounded-2xl bg-[#0A2540] text-white shadow-md space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Official Support
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-200">
                  <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                  <a href={`mailto:${conference.support_email || 'scinsmedia@gmail.com'}`} className="hover:text-teal-300 transition-colors">
                    {conference.support_email || 'scinsmedia@gmail.com'}
                  </a>
                </div>
                <div className="flex items-center space-x-2 text-slate-200">
                  <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                  <a
                    href={`tel:${(conference.support_phone || '+1 (415) 800-3490').replace(/[^+\d]/g, '')}`}
                    className="hover:text-teal-300 transition-colors"
                  >
                    {conference.support_phone || '+1 (415) 800-3490'}
                    {conference.support_label ? ` (${conference.support_label})` : (conference.support_phone && conference.support_phone.includes('(') ? '' : ' (Secretariat Desk)')}
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                {conference.support_turnaround || 'Typical response turnaround is within 24 hours on business days.'}
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 md:p-10">
              {submittedRefId ? (
                /* Success View */
                <div className="py-8 text-center space-y-5 animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900 font-display">
                      Thank You! Enquiry Submitted
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Your query regarding <strong className="text-slate-800">{conference.short_title || conference.title}</strong> has been successfully received by our organizing team.
                    </p>
                    <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 mt-2">
                      Reference ID: #{submittedRefId}
                    </div>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-2.5 bg-[#0A2540] hover:bg-[#0E7490] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      Send Another Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                /* Contact Form */
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      Send an Enquiry
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Please provide your contact details below. Our conference secretariat will get back to you shortly.
                    </p>
                  </div>

                  {serverError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Submission Error</div>
                        <div>{serverError}</div>
                      </div>
                    </div>
                  )}

                  {/* 1. Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="conf-contact-fullname" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="conf-contact-fullname"
                        type="text"
                        value={fullName}
                        onChange={e => {
                          setFullName(e.target.value);
                          if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                        }}
                        placeholder="Dr. / Prof. / Jane Doe"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-colors ${
                          errors.fullName ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-teal-500'
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-[11px] font-medium">{errors.fullName}</p>
                    )}
                  </div>

                  {/* 2. Contact Number with Country Code */}
                  <div className="space-y-1.5">
                    <label htmlFor="conf-contact-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-xl overflow-hidden shadow-2xs">
                      <select
                        aria-label="Country dial code"
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className="bg-slate-100 border border-r-0 border-slate-200 px-2.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white cursor-pointer shrink-0"
                      >
                        {COUNTRY_DIAL_CODES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.code} ({c.country})
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="conf-contact-phone"
                          type="tel"
                          value={phone}
                          onChange={e => {
                            setPhone(e.target.value);
                            if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                          }}
                          placeholder="Phone / Mobile Number"
                          className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-r-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-colors ${
                            errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-teal-500'
                          }`}
                        />
                      </div>
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-[11px] font-medium">{errors.phone}</p>
                    )}
                  </div>

                  {/* 3. Email ID */}
                  <div className="space-y-1.5">
                    <label htmlFor="conf-contact-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="conf-contact-email"
                        type="email"
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                        }}
                        placeholder="academic.email@university.edu"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-colors ${
                          errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-teal-500'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-[11px] font-medium">{errors.email}</p>
                    )}
                  </div>

                  {/* 4. Query / Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="conf-contact-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Query / Message
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <textarea
                        id="conf-contact-message"
                        rows={4}
                        value={message}
                        onChange={e => {
                          setMessage(e.target.value);
                          if (errors.message) setErrors(prev => ({ ...prev, message: '' }));
                        }}
                        placeholder="Please write your query regarding registration, abstract submission, visa letter, speaker slots, or sponsorship (optional)..."
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-colors resize-y ${
                          errors.message ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-teal-500'
                        }`}
                      />
                    </div>
                    {errors.message && (
                      <p className="text-red-500 text-[11px] font-medium">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 bg-[#0A2540] hover:bg-[#0E7490] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Query...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Contact Query</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
