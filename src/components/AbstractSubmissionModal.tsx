import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Upload,
  FileText,
  Download,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Globe,
  Building,
  Calendar,
  MapPin,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conference } from '../types';
import { api } from '../services/api';

interface AbstractSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference;
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

export const AbstractSubmissionModal: React.FC<AbstractSubmissionModalProps> = ({
  isOpen,
  onClose,
  conference
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    country: 'United States',
    abstractTitle: '',
    presentation_preference: 'Oral' as 'Oral' | 'Poster' | 'Keynote' | 'Virtual',
    file_name: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        resetAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting]);

  if (!isOpen) return null;

  const resetAndClose = () => {
    if (submitting) return;
    setSubmitted(false);
    setErrorMessage(null);
    setFileData('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      institution: '',
      country: 'United States',
      abstractTitle: '',
      presentation_preference: 'Oral',
      file_name: ''
    });
    onClose();
  };

  const processFile = (file: File) => {
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const lowerName = file.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => lowerName.endsWith(ext));

    if (!isValidExt) {
      setErrorMessage('Invalid file format. Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 25 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFileData(base64);
      setFormData(prev => ({ ...prev, file_name: file.name }));
      setErrorMessage(null);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from your device. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedInst = formData.institution.trim();
    const trimmedTitle = formData.abstractTitle.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Please provide a valid Email address.');
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 5) {
      setErrorMessage('Please enter your Mobile / WhatsApp Number.');
      return;
    }
    if (!trimmedInst) {
      setErrorMessage('Please enter your Institution or Organization.');
      return;
    }
    if (!trimmedTitle) {
      setErrorMessage('Please enter your Abstract / Presentation Title.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitAbstract({
        conference_id: conference.id,
        conference_title: conference.title,
        title: trimmedTitle,
        abstract_text: '',
        keywords: '',
        research_domain: conference.domain || '',
        presentation_preference: formData.presentation_preference,
        primary_author_name: trimmedName,
        primary_author_email: trimmedEmail,
        primary_author_phone: trimmedPhone,
        primary_author_affiliation: trimmedInst,
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
      setErrorMessage(err?.message || 'Failed to submit abstract. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="abstract-submission-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden my-6 sm:my-8 animate-in fade-in zoom-in-95 duration-150 relative text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white p-5 sm:p-6 border-b border-slate-200 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0 pr-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 inline-flex items-center space-x-1 shadow-2xs">
                  <FileText className="w-3 h-3 text-[#0E7490]" />
                  <span>Call for Abstracts</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {conference.conference_code || 'SCINS-2026'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                Submit Abstract
              </h3>
              <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                {conference.title}
              </p>
            </div>

            {/* Top-Right Actions: Sample Download & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={conference.sample_abstract_url || '/uploads/sample_abstract-1791699502920-8841.pdf'}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-[#0E7490] border border-teal-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                title={`Download Sample Abstract Template for ${conference.short_title || conference.title}`}
              >
                <Download className="w-3.5 h-3.5 text-[#0E7490] group-hover:-translate-y-0.5 transition-transform shrink-0" />
                <span className="hidden sm:inline">Sample Download</span>
                <span className="sm:hidden">Sample</span>
              </a>

              <button
                type="button"
                onClick={resetAndClose}
                disabled={submitting}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
        {submitted ? (
          <div className="p-8 text-center space-y-5 bg-white">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0E7490] shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                Abstract Submitted Successfully!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Thank you, <strong className="text-slate-900">{formData.name}</strong>. Your abstract titled <em className="text-[#0E7490] font-semibold">"{formData.abstractTitle}"</em> has been received by the International Scientific Committee.
              </p>
              <p className="text-xs text-slate-500 pt-1">
                A formal acknowledgment and peer review evaluation timeline has been sent to <strong className="text-slate-800">{formData.email}</strong>.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-6 py-3 bg-[#0A2540] hover:bg-[#0E7490] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all inline-flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Conference</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 max-h-[75vh] overflow-y-auto bg-white">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Author Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Primary Author Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Robert Vance"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    disabled={submitting}
                    className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Country & Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Institution / Org <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stanford University"
                    value={formData.institution}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    disabled={submitting}
                    className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Abstract / Presentation Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Abstract / Presentation Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Synthesis and Characterization of Novel Bio-based Nanocomposites"
                value={formData.abstractTitle}
                onChange={e => setFormData({ ...formData, abstractTitle: e.target.value })}
                disabled={submitting}
                className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-all"
              />
            </div>

            {/* Presentation Preference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Presentation Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Oral', 'Poster', 'Keynote', 'Virtual'] as const).map(pref => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFormData({ ...formData, presentation_preference: pref })}
                    className={`py-2 px-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                      formData.presentation_preference === pref
                        ? 'bg-teal-50 text-[#0E7490] border-teal-500 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload / Attachment */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Abstract Document <span className="text-slate-400 font-normal lowercase">(PDF, DOC, DOCX up to 25MB)</span>
                </label>
                <a
                  href={conference.sample_abstract_url || '/uploads/sample_abstract-1791699502920-8841.pdf'}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#0E7490] hover:underline flex items-center space-x-1 font-semibold"
                >
                  <Download className="w-3 h-3 text-[#0E7490]" />
                  <span>Download Sample</span>
                </a>
              </div>
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 hover:border-[#0E7490] rounded-2xl cursor-pointer bg-slate-50/70 hover:bg-teal-50/20 transition-all group">
                <Upload className="w-7 h-7 text-slate-400 group-hover:text-[#0E7490] transition-colors mb-1.5" />
                <span className="text-xs text-slate-600 font-medium text-center">
                  {formData.file_name ? (
                    <span className="text-[#0E7490] font-bold">{formData.file_name}</span>
                  ) : (
                    <>
                      <span className="text-[#0E7490] font-semibold">Click to upload</span> or drag and drop your abstract file
                    </>
                  )}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Supports standard scientific formats (PDF, DOC, DOCX)</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) processFile(f);
                  }}
                  className="hidden"
                />
              </label>
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
                    <span>Submitting Abstract...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Submit Abstract for Peer Review</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetAndClose}
                disabled={submitting}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center justify-center space-x-1 cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Conference</span>
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E7490]" />
              <span>Submissions are strictly evaluated under international peer review standards</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
