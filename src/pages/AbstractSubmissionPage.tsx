import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowLeft,
  Download,
  CreditCard,
  Send,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conference } from '../types';
import { api } from '../services/api';

interface AbstractSubmissionPageProps {
  conference: Conference;
  conferences?: Conference[];
  lockConference?: boolean;
  onNavigate: (path: string) => void;
  onSelectConference?: (slug: string) => void;
}

const COUNTRIES = [
  'United States', 'United Kingdom', 'France', 'Germany', 'Canada', 'Australia',
  'India', 'China', 'Japan', 'South Korea', 'Singapore', 'Switzerland',
  'Netherlands', 'Sweden', 'Italy', 'Spain', 'Brazil', 'Mexico', 'South Africa',
  'United Arab Emirates', 'Saudi Arabia', 'New Zealand', 'Ireland', 'Belgium',
  'Denmark', 'Norway', 'Finland', 'Portugal', 'Austria', 'Poland', 'Turkey',
  'Israel', 'Egypt', 'Nigeria', 'Kenya', 'Malaysia', 'Indonesia', 'Thailand',
  'Vietnam', 'Philippines', 'Argentina', 'Chile', 'Colombia', 'Russia',
  'Other'
];

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

export const AbstractSubmissionPage: React.FC<AbstractSubmissionPageProps> = ({
  conference,
  conferences,
  lockConference = true,
  onNavigate,
  onSelectConference
}) => {
  const [currentConference, setCurrentConference] = useState<Conference>(conference);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fileData, setFileData] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract slug/ID from URL pathname if on an individual conference path
  const routeSlug = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname || '';
      if (path.startsWith('/conferences/')) {
        const parts = path.replace('/conferences/', '').split('/');
        return parts[0]?.split('?')[0]?.split('#')[0] || undefined;
      }
      if (path.startsWith('/abstract/')) {
        return path.replace('/abstract/', '').split('/')[0]?.split('?')[0]?.split('#')[0] || undefined;
      }
      if (path.startsWith('/submit-abstract/')) {
        return path.replace('/submit-abstract/', '').split('/')[0]?.split('?')[0]?.split('#')[0] || undefined;
      }
    }
    return undefined;
  }, []);

  // Update current conference when conference prop changes
  React.useEffect(() => {
    if (conference) {
      setCurrentConference(conference);
    }
  }, [conference]);

  // Reactive URL slug/ID synchronization: automatically load database record and preserve selection on refresh
  React.useEffect(() => {
    const targetSlug = routeSlug || conference?.slug || (conference?.id ? String(conference.id) : undefined);
    if (!targetSlug) return;

    api.getConferenceBySlug(targetSlug)
      .then(res => {
        if (res && res.id) {
          setCurrentConference(res);
        }
      })
      .catch(err => {
        console.warn('Could not load conference record by slug/ID:', err);
        if (conferences && conferences.length > 0) {
          const match = conferences.find(c => c.slug === targetSlug || String(c.id) === targetSlug);
          if (match) setCurrentConference(match);
        }
      });
  }, [routeSlug, conference?.slug, conference?.id]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country_code: '+1',
    institution: '',
    country: 'United States',
    presentation_preference: 'Oral' as 'Oral' | 'Poster' | 'Keynote',
    file_name: ''
  });
  const [agreed, setAgreed] = useState(true);

  const handleCountryChange = (selectedCountry: string) => {
    const match = COUNTRY_DIAL_CODES.find(c => c.country === selectedCountry);
    setFormData(prev => ({
      ...prev,
      country: selectedCountry,
      country_code: match ? match.dial : prev.country_code
    }));
  };

  const processSelectedFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const lowerName = file.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => lowerName.endsWith(ext));

    if (!isValidExt) {
      alert('Invalid file format. Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFileData(base64);
      setFormData(prev => ({ ...prev, file_name: file.name }));
    };
    reader.onerror = () => {
      alert('Failed to read file from your device. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter your contact number.');
      return;
    }
    if (!formData.country.trim()) {
      alert('Please select your country.');
      return;
    }

    setSubmitting(true);
    const fullPhone = `${formData.country_code} ${formData.phone}`.trim();
    try {
      await api.submitAbstract({
        conference_id: conference.id,
        conference_title: conference.title,
        title: formData.name ? `${formData.name.trim()} — Abstract Submission` : 'Untitled Abstract',
        abstract_text: '',
        keywords: '',
        research_domain: conference.domain || '',
        presentation_preference: formData.presentation_preference,
        primary_author_name: formData.name.trim(),
        primary_author_email: formData.email.trim(),
        primary_author_phone: fullPhone,
        primary_author_affiliation: formData.institution.trim(),
        primary_author_country: formData.country,
        file_name: formData.file_name || undefined,
        file_data: fileData || undefined
      } as any);
      setSubmitted(true);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err: any) {
      console.error('[Abstract Submission Error]:', err);
      // In case of error, show message
      const msg = err?.message || 'Submission encountered an error. Please try again.';
      setErrorMessage(msg);
      alert(msg);
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
            onClick={() => onNavigate(`/conferences/${currentConference.slug}`)}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {currentConference.short_title || currentConference.title}</span>
          </button>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 text-slate-900 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="relative z-10 space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-3 py-1 rounded-full border border-teal-200 font-mono">
                  Call for Papers & Abstracts
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {currentConference.domain || 'Scientific Submission'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                Submit Abstract — {currentConference.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                Submit your scientific abstract for peer review by the International Scientific Committee. Oral presentations, plenary forums, poster sessions, and virtual presentations are currently accepted.
              </p>

              {/* Conference Selector: omitted on individual conference pages */}
              {!lockConference && conferences && conferences.length > 1 && (
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Selected Conference:
                  </label>
                  <select
                    value={currentConference.id}
                    onChange={(e) => {
                      const found = conferences.find(c => c.id === Number(e.target.value));
                      if (found) {
                        setCurrentConference(found);
                        if (onSelectConference) onSelectConference(found.slug);
                      }
                    }}
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#0E7490] w-full sm:max-w-md cursor-pointer"
                  >
                    {conferences.map(c => (
                      <option key={c.id} value={c.id} className="bg-white text-slate-900">
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0E7490]" />
                  <span>{currentConference.dates_label || `${currentConference.start_date} – ${currentConference.end_date}`}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0E7490]" />
                  <span>{currentConference.city}, {currentConference.country}</span>
                </span>
                {currentConference.journal_name && (
                  <span className="text-[#0E7490] font-medium">
                    Official Journal: {currentConference.journal_name}
                  </span>
                )}
              </div>
            </div>

            {/* Top-Right Sample Download in Hero */}
            <div className="shrink-0 pt-1">
              {(() => {
                const sampleUrl = currentConference.sample_abstract_url || '/uploads/sample_abstract-1791699502920-8841.pdf';
                const isDocx = sampleUrl.toLowerCase().includes('.docx');
                const isDoc = !isDocx && sampleUrl.toLowerCase().includes('.doc');
                const formatLabel = isDocx ? '.docx' : isDoc ? '.doc' : '.pdf';
                return (
                  <a
                    href={sampleUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-[#0E7490] border border-teal-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                    title={`Download Official Sample Abstract Template (${formatLabel}) for ${currentConference.short_title || currentConference.title}`}
                  >
                    <Download className="w-4 h-4 text-[#0E7490] group-hover:-translate-y-0.5 transition-transform" />
                    <span>Download Sample Abstract ({formatLabel})</span>
                  </a>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Form Container or Success Screen */}
        {submitted ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                Abstract Submitted Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-800">{formData.name}</strong>. Your abstract has been registered under <strong className="text-slate-800">{currentConference.title}</strong> and dispatched to the Scientific Committee.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 max-w-md mx-auto text-left text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Author:</span>
                <span className="font-semibold text-slate-800">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact Number:</span>
                <span className="font-semibold text-slate-800">{formData.country_code} {formData.phone}</span>
              </div>
              {formData.institution && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Institution:</span>
                  <span className="font-semibold text-slate-800">{formData.institution}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Country:</span>
                <span className="font-semibold text-slate-800">{formData.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="font-semibold text-teal-700">{formData.presentation_preference} Presentation</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate(`/conferences/${currentConference.slug}/register`)}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Register as Delegate</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate(`/conferences/${currentConference.slug}`)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Return to Conference Overview
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Header with Top-Right Sample Abstract Template Download Button */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    Primary Author & Abstract Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fields marked with an asterisk are required for peer review.
                  </p>
                </div>

                {/* Top-Right Download Sample Abstract Template Button */}
                <div className="shrink-0">
                  {(() => {
                    const sampleUrl = currentConference.sample_abstract_url || '/uploads/sample_abstract-1791699502920-8841.pdf';
                    const isDocx = sampleUrl.toLowerCase().includes('.docx');
                    const isDoc = !isDocx && sampleUrl.toLowerCase().includes('.doc');
                    const formatLabel = isDocx ? '.docx' : isDoc ? '.doc' : '.pdf';
                    return (
                      <a
                        href={sampleUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-[#0E7490] border border-teal-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                        title={`Download Official Sample Abstract Template (${formatLabel}) for ${currentConference.short_title || currentConference.title}`}
                      >
                        <Download className="w-3.5 h-3.5 text-[#0E7490] group-hover:-translate-y-0.5 transition-transform" />
                        <span>Download Sample Abstract Template ({formatLabel})</span>
                      </a>
                    );
                  })()}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Full Name * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Smith"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                  />
                </div>

                {/* 2. Email Address * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. j.smith@university.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                  />
                </div>

                {/* 3. Contact Number * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex">
                    <select
                      value={formData.country_code}
                      onChange={e => setFormData({ ...formData, country_code: e.target.value })}
                      className="w-28 sm:w-32 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl px-2 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors cursor-pointer"
                      title="International Calling Code"
                    >
                      {COUNTRY_DIAL_CODES.map(c => (
                        <option key={c.country + c.dial} value={c.dial}>
                          {c.code} ({c.dial})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 555-123-4567"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-r-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                    />
                  </div>
                </div>

                {/* 4. Country * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.country}
                    onChange={e => handleCountryChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors cursor-pointer"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Institution / University (Optional - No Asterisk) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University / CNRS (Optional)"
                    value={formData.institution}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                  />
                </div>
              </div>

              {/* Presentation Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Presentation Preference
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Oral', 'Poster', 'Keynote'] as const).map(pref => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setFormData({ ...formData, presentation_preference: pref })}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        formData.presentation_preference === pref
                          ? 'border-teal-600 bg-teal-50/80 text-teal-900 ring-1 ring-teal-600 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pref} Presentation
                    </button>
                  ))}
                </div>
              </div>

              {/* Abstract Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Abstract Document (.doc, .docx, .pdf)
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) processSelectedFile(f);
                  }}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors bg-slate-50/50"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-700">
                    {formData.file_name ? (
                      <span className="text-teal-800 font-bold">Selected: {formData.file_name}</span>
                    ) : (
                      'Drag and drop abstract document here, or browse files'
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Maximum file size: 10 MB (.pdf, .doc, .docx)</p>
                  <label className="mt-3 inline-block cursor-pointer">
                    <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs inline-block">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) processSelectedFile(f);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="flex items-start space-x-2.5 pt-2">
                <input
                  type="checkbox"
                  id="abstract-terms"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="abstract-terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                  I confirm that this abstract represents original scientific research and that all co-authors have approved this submission for peer evaluation at <span className="font-semibold text-slate-700">{conference.title}</span>.
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submitting || !agreed}
                  className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>{submitting ? 'Submitting Abstract...' : 'Submit Abstract for Review'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
