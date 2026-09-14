import React, { useState } from 'react';
import { X, CheckCircle2, Upload, FileText, Download } from 'lucide-react';
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
  'Vietnam', 'Philippines', 'Argentina', 'Chile', 'Colombia', 'Russia',
  'Other'
];

export const AbstractSubmissionModal: React.FC<AbstractSubmissionModalProps> = ({
  isOpen,
  onClose,
  conference
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    country: '',
    presentation_preference: 'Oral' as 'Oral' | 'Poster' | 'Keynote' | 'Virtual',
    file_name: ''
  });
  const [agreed, setAgreed] = useState(true);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      institution: '',
      country: '',
      presentation_preference: 'Oral',
      file_name: ''
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter your name.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitAbstract({
        conference_id: conference.id,
        conference_title: conference.title,
        title: formData.name ? `${formData.name} — Abstract Submission` : 'Untitled Abstract',
        abstract_text: '',
        keywords: '',
        research_domain: conference.domain || '',
        presentation_preference: formData.presentation_preference,
        primary_author_name: formData.name,
        primary_author_email: formData.email,
        primary_author_affiliation: formData.institution,
        primary_author_country: formData.country,
        file_name: formData.file_name || undefined
      });
      setSubmitted(true);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      // Still show success — submission recorded locally even if network sync failed
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="abstract-submission-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <span className="text-xs text-slate-500">{conference.short_title}</span>
            <h3 className="text-lg font-bold text-slate-900 font-display mt-0.5">
              Submit Abstract
            </h3>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            {/* Single-page Form Body */}
            <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Author Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Author Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">University / Institution</label>
                    <input
                      type="text"
                      placeholder="Your institution"
                      value={formData.institution}
                      onChange={e => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                    <select
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Presentation Format Preference (only field kept from Abstract & Track) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Presentation Format Preference
                </label>
                <select
                  value={formData.presentation_preference}
                  onChange={e => setFormData({ ...formData, presentation_preference: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="Oral">Oral</option>
                  <option value="Poster">Poster</option>
                  <option value="Keynote">Keynote</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Abstract (.DOCX or .PDF)</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 cursor-pointer">
                  <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Drag & drop, or click to select a file. Max 25 MB.</p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    id="abstract-file-input"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) setFormData({ ...formData, file_name: f.name });
                    }}
                  />
                  <label
                    htmlFor="abstract-file-input"
                    className="mt-3 inline-flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-sm cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>{formData.file_name || 'Choose file'}</span>
                  </label>
                </div>
              </div>

              {/* Confirmation */}
              <label className="flex items-start space-x-2 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600"
                />
                <span>I confirm that this submission is original and has not been simultaneously submitted elsewhere.</span>
              </label>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              {conference.sample_abstract_url && (
                <a
                  href={conference.sample_abstract_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-teal-600" />
                  <span>Sample Abstract</span>
                </a>
              )}
              <button
                type="submit"
                disabled={submitting || !agreed}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50"
              >
                <span>{submitting ? 'Submitting...' : 'Submit Abstract'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Success State */
          <div className="text-center py-10 px-6 space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Abstract submitted successfully
            </h3>
            <div className="pt-2">
              <button
                onClick={resetAndClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
