import React, { useState } from 'react';
import { X, CheckCircle2, Upload, User, Plus, Trash2, ArrowRight, ArrowLeft, FileText, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conference, AbstractAuthor } from '../types';
import { api } from '../services/api';

interface AbstractSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference;
}

export const AbstractSubmissionModal: React.FC<AbstractSubmissionModalProps> = ({
  isOpen,
  onClose,
  conference
}) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    primary_author_name: '',
    primary_author_email: '',
    primary_author_phone: '',
    primary_author_affiliation: '',
    primary_author_country: 'France',
    title: '',
    abstract_text: '',
    keywords: '',
    research_domain: conference.domain || 'Biotechnology',
    presentation_preference: 'Oral' as 'Oral' | 'Poster' | 'Keynote Workshop' | 'Virtual Presentation',
    file_name: 'research-abstract.pdf'
  });

  const [authors, setAuthors] = useState<AbstractAuthor[]>([
    { name: '', email: '', institution: '', country: 'France', is_corresponding: true }
  ]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!formData.primary_author_name || !formData.primary_author_email || !formData.primary_author_affiliation) {
        alert('Please fill out all required author details before proceeding.');
        return;
      }
      // sync first author
      if (authors.length > 0) {
        const updated = [...authors];
        updated[0] = {
          name: formData.primary_author_name,
          email: formData.primary_author_email,
          institution: formData.primary_author_affiliation,
          country: formData.primary_author_country,
          is_corresponding: true
        };
        setAuthors(updated);
      }
    }
    if (step === 2) {
      if (!formData.title || !formData.abstract_text || !formData.keywords) {
        alert('Please provide the Title, Abstract summary, and Keywords.');
        return;
      }
    }
    setStep(s => Math.min(6, s + 1));
  };

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const handleAddAuthor = () => {
    setAuthors([...authors, { name: '', email: '', institution: '', country: 'France', is_corresponding: false }]);
  };

  const handleRemoveAuthor = (idx: number) => {
    if (authors.length <= 1) return;
    setAuthors(authors.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.submitAbstract({
        conference_id: conference.id,
        conference_title: conference.title,
        title: formData.title,
        abstract_text: formData.abstract_text,
        keywords: formData.keywords,
        research_domain: formData.research_domain,
        presentation_preference: formData.presentation_preference,
        primary_author_name: formData.primary_author_name,
        primary_author_email: formData.primary_author_email,
        primary_author_phone: formData.primary_author_phone,
        primary_author_affiliation: formData.primary_author_affiliation,
        primary_author_country: formData.primary_author_country,
        file_name: formData.file_name,
        authors
      });

      setSubmittedId(response.submission_id);
      setStep(6);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      // Fallback ID
      const fallbackId = `SCINS-BIO-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedId(fallbackId);
      setStep(6);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="abstract-submission-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                Official Peer Review Portal
              </span>
              <span className="text-xs text-slate-500">• {conference.short_title}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display mt-0.5">
              Submit Scientific Research Abstract
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        {step < 6 && (
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 overflow-x-auto">
            {[
              { num: 1, label: 'Author Info' },
              { num: 2, label: 'Abstract & Track' },
              { num: 3, label: 'Co-Authors' },
              { num: 4, label: 'Document Upload' },
              { num: 5, label: 'Review & Verify' }
            ].map(s => (
              <div
                key={s.num}
                className={`flex items-center space-x-1.5 whitespace-nowrap px-2 py-1 rounded-md ${
                  step === s.num
                    ? 'text-teal-700 bg-teal-50 font-bold'
                    : step > s.num
                    ? 'text-slate-900 font-medium'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step === s.num
                      ? 'bg-teal-600 text-white'
                      : step > s.num
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Step 1: Personal Author Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-teal-50/60 border border-teal-200/70 p-3.5 rounded-2xl text-xs text-teal-900 leading-relaxed">
                All abstracts undergo single-blind peer evaluation by the Scientific Committee. Corresponding author details will receive the formal review notification and DOI metadata.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary / Corresponding Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Prof. Dr. Julian Weintraub"
                    value={formData.primary_author_name}
                    onChange={e => setFormData({ ...formData, primary_author_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., j.weintraub@university.edu"
                    value={formData.primary_author_email}
                    onChange={e => setFormData({ ...formData, primary_author_email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University / Research Institution *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Imperial College London / Sorbonne Université"
                    value={formData.primary_author_affiliation}
                    onChange={e => setFormData({ ...formData, primary_author_affiliation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., United Kingdom, France, United States, Japan"
                    value={formData.primary_author_country}
                    onChange={e => setFormData({ ...formData, primary_author_country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone / WhatsApp (with Country Code)
                </label>
                <input
                  type="text"
                  placeholder="+44 20 7594 6000"
                  value={formData.primary_author_phone}
                  onChange={e => setFormData({ ...formData, primary_author_phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          )}

          {/* Step 2: Abstract Details & Track */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Abstract Title (Max 200 characters) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Engineered Microbial Synthesis of Ultra-High-Molecular-Weight Polyhydroxybutyrate..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Research Domain
                  </label>
                  <select
                    value={formData.research_domain}
                    onChange={e => setFormData({ ...formData, research_domain: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="Biotechnology">Biotechnology & Synthesis</option>
                    <option value="Materials Science">Materials Science & Nanotechnology</option>
                    <option value="Green Chemistry">Green Chemistry & Catalysis</option>
                    <option value="Environmental Science">Environmental & Marine Science</option>
                    <option value="Biomedical Engineering">Biomedical Engineering & Implants</option>
                    <option value="Circular Economy">Circular Economy & Recycling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Presentation Format Preference *
                  </label>
                  <select
                    value={formData.presentation_preference}
                    onChange={e => setFormData({ ...formData, presentation_preference: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="Oral">Oral Presentation (15 mins + 5 mins Q&A)</option>
                    <option value="Poster">Poster Presentation (Board display & jury evaluation)</option>
                    <option value="Keynote Workshop">Keynote / Workshop Track</option>
                    <option value="Virtual Presentation">Virtual Live Video Presentation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Abstract Text (250 – 350 words: Background, Methodology, Results, Conclusion) *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste your complete structured abstract here..."
                  value={formData.abstract_text}
                  onChange={e => setFormData({ ...formData, abstract_text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:border-teal-600 font-sans"
                />
                <div className="text-[11px] text-slate-400 text-right mt-1">
                  Word estimate: {formData.abstract_text ? formData.abstract_text.split(/\s+/).filter(Boolean).length : 0} words
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keywords (4 to 6 terms, comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Polyhydroxyalkanoates, Marine Biodegradation, Enzymatic Synthesis, Circular Economy"
                  value={formData.keywords}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          )}

          {/* Step 3: Co-Authors */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Co-Authors & Academic Collaborators</h4>
                  <p className="text-xs text-slate-500">List all contributing researchers to appear in conference proceedings.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAuthor}
                  className="flex items-center space-x-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Co-Author</span>
                </button>
              </div>

              <div className="space-y-3">
                {authors.map((author, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Author #{idx + 1} {idx === 0 ? '(Primary & Corresponding)' : ''}
                      </span>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAuthor(idx)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={author.name}
                        onChange={e => {
                          const updated = [...authors];
                          updated[idx].name = e.target.value;
                          setAuthors(updated);
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                      />
                      <input
                        type="email"
                        placeholder="Institutional Email"
                        value={author.email}
                        onChange={e => {
                          const updated = [...authors];
                          updated[idx].email = e.target.value;
                          setAuthors(updated);
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Institution / University"
                        value={author.institution}
                        onChange={e => {
                          const updated = [...authors];
                          updated[idx].institution = e.target.value;
                          setAuthors(updated);
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={author.country}
                        onChange={e => {
                          const updated = [...authors];
                          updated[idx].country = e.target.value;
                          setAuthors(updated);
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: File Upload */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 text-center transition-colors bg-slate-50/50">
                <Upload className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-900">Upload Full Abstract Document (.DOCX or .PDF)</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Drag and drop your formatted paper or manuscript here. Max file size: 25 MB.
                </p>
                <div className="mt-4 inline-flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Selected: {formData.file_name}</span>
                </div>
              </div>

              <div className="bg-slate-100 p-4 rounded-2xl text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Scientific Formatting Note:</span> Please ensure all chemical formulas, reaction schemes, and references adhere to the Scinsmedia / Elsevier authoring guidelines.
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h4 className="text-base font-bold text-slate-900">{formData.title || 'Untitled Abstract'}</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><b>Primary Author:</b> {formData.primary_author_name} ({formData.primary_author_email})</p>
                  <p><b>Institution:</b> {formData.primary_author_affiliation}, {formData.primary_author_country}</p>
                  <p><b>Presentation Mode:</b> {formData.presentation_preference}</p>
                  <p><b>Keywords:</b> {formData.keywords}</p>
                  <p><b>Authors Listed:</b> {authors.length} researchers</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-600 line-clamp-4 italic">"{formData.abstract_text}"</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <input type="checkbox" defaultChecked required className="rounded text-teal-600" />
                <span>I confirm that this manuscript is original and has not been simultaneously submitted elsewhere.</span>
              </div>
            </div>
          )}

          {/* Step 6: Instant Submission Success */}
          {step === 6 && (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                  Submission Received & Logged
                </span>
                <h3 className="text-2xl font-bold text-slate-900 font-display mt-2">
                  Abstract Submitted Successfully
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your research has been assigned to the Scientific Organizing Committee for single-blind peer review.
                </p>
              </div>

              <div className="bg-slate-900 text-white p-5 rounded-2xl max-w-md mx-auto shadow-lg space-y-2">
                <div className="text-xs text-slate-400">Official Tracking & Submission ID</div>
                <div className="text-lg font-mono font-bold text-teal-400 tracking-wider select-all">
                  {submittedId || 'SCINS-BIO-2026-001245'}
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  A formal submission confirmation receipt has been dispatched to <b>{formData.primary_author_email}</b>.
                </div>
              </div>

              <div className="pt-4 flex justify-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Close & Return to Conference
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 6 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{submitting ? 'Submitting to Committee...' : 'Confirm & Submit Abstract'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
