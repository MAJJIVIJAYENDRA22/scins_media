import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  Presentation,
  Award,
  Users,
  Layers,
  Calendar,
  MapPin,
  FileText,
  Upload,
  Globe,
  ArrowRight,
  ArrowLeft,
  Info,
  Building,
  Mail,
  User,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conference, ProposalType, ProposalSubmission } from '../types';
import { INITIAL_CONFERENCES } from '../data/initialData';
import { api } from '../services/api';

interface ProposalSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conferences?: Conference[];
  defaultConferenceId?: number;
  defaultType?: ProposalType;
  onProposalSubmitted?: (proposal: ProposalSubmission) => void;
}

export const ProposalSubmissionModal: React.FC<ProposalSubmissionModalProps> = ({
  isOpen,
  onClose,
  conferences = INITIAL_CONFERENCES,
  defaultConferenceId,
  defaultType = 'workshop',
  onProposalSubmitted
}) => {
  const [step, setStep] = useState(1);
  const [proposalType, setProposalType] = useState<ProposalType>(defaultType);
  const [selectedConfId, setSelectedConfId] = useState<number>(
    defaultConferenceId || (conferences[0] ? conferences[0].id : 1)
  );

  const selectedConf = conferences.find(c => c.id === Number(selectedConfId)) || conferences[0];

  // Proposer profile
  const [proposerTitle, setProposerTitle] = useState('Prof.');
  const [proposerName, setProposerName] = useState('');
  const [proposerEmail, setProposerEmail] = useState('');
  const [proposerPhone, setProposerPhone] = useState('');
  const [proposerAffiliation, setProposerAffiliation] = useState('');
  const [proposerDepartment, setProposerDepartment] = useState('');
  const [proposerCountry, setProposerCountry] = useState('France');
  const [proposerBio, setProposerBio] = useState('');
  const [coPresenters, setCoPresenters] = useState('');

  // Proposal content
  const [title, setTitle] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [targetAudience, setTargetAudience] = useState('Senior Researchers, Clinicians, and Industry Delegates');
  const [durationFormat, setDurationFormat] = useState('90-Minute Interactive Workshop');
  const [avRequirements, setAvRequirements] = useState('Dual 4K Projectors, Podium Microphone, High-Speed Wi-Fi');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // State flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProposal, setSubmittedProposal] = useState<ProposalSubmission | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !proposerName.trim() || !proposerEmail.trim() || !abstractText.trim()) {
      setErrorMsg('Please complete all required fields (Session Title, Proposer Name, Email, and Abstract).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload: Partial<ProposalSubmission> = {
        conference_id: selectedConf ? selectedConf.id : 1,
        conference_title: selectedConf ? selectedConf.title : 'SCINS International Congress',
        conference_city: selectedConf ? selectedConf.city : 'Paris',
        conference_country: selectedConf ? selectedConf.country : 'France',
        proposal_type: proposalType,
        title: title.trim(),
        proposer_title: proposerTitle,
        proposer_name: proposerName.trim(),
        proposer_email: proposerEmail.trim(),
        proposer_phone: proposerPhone.trim(),
        proposer_affiliation: proposerAffiliation.trim(),
        proposer_department: proposerDepartment.trim(),
        proposer_country: proposerCountry,
        proposer_bio: proposerBio.trim(),
        co_presenters: coPresenters.trim(),
        abstract: abstractText.trim(),
        learning_objectives: learningObjectives.trim(),
        target_audience: targetAudience.trim(),
        duration_format: durationFormat,
        av_requirements: avRequirements.trim(),
        file_name: uploadedFileName || `${proposalType}-proposal-summary.pdf`,
        file_url: 'https://scinsmedia.com/proposals/uploads/proposal.pdf'
      };

      const result = await api.submitProposal(payload);
      setSubmittedProposal(result);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // no-op
      }

      if (onProposalSubmitted) {
        onProposalSubmitted(result);
      }
    } catch (err: any) {
      console.error('Proposal submission error:', err);
      setErrorMsg(err?.message || 'Failed to submit proposal to Secretariat. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tracks = [
    {
      type: 'workshop' as ProposalType,
      title: 'Workshop / Masterclass',
      desc: 'Hands-on clinical or technical training (90–180 mins)',
      icon: Presentation,
      badge: 'Interactive'
    },
    {
      type: 'keynote_forum' as ProposalType,
      title: 'Keynote Plenary Forum',
      desc: 'Distinguished 45-min plenary address for senior PIs & leaders',
      icon: Award,
      badge: 'Distinguished'
    },
    {
      type: 'poster' as ProposalType,
      title: 'Poster Presentation',
      desc: 'Visual scientific poster display & Young Investigator competition',
      icon: Layers,
      badge: 'Young Scholars'
    },
    {
      type: 'symposium' as ProposalType,
      title: 'Thematic Symposium',
      desc: 'Multi-speaker thematic session organized by an academic chair',
      icon: Users,
      badge: 'Panel / Track'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-6 max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 sm:p-6 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800 font-mono">
                Call for Proposals • Global Congresses
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              {submittedProposal ? 'Proposal Submission Confirmed' : 'Invite Proposals: Workshops, Keynotes & Posters'}
            </h2>
            <p className="text-xs text-slate-300">
              Showcase your scientific leadership, lead practical workshops, and chair plenary sessions worldwide.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (if not submitted) */}
        {!submittedProposal && (
          <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`font-semibold cursor-pointer ${step === 1 ? 'text-teal-800 underline' : 'hover:text-slate-900'}`}
              >
                1. Track & Conference
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`font-semibold cursor-pointer ${step === 2 ? 'text-teal-800 underline' : 'hover:text-slate-900'}`}
              >
                2. Proposer Profile
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setStep(3)}
                className={`font-semibold cursor-pointer ${step === 3 ? 'text-teal-800 underline' : 'hover:text-slate-900'}`}
              >
                3. Proposal Curriculum
              </button>
            </div>

            <span className="text-[11px] font-mono font-bold text-slate-500">Step {step} of 3</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center space-x-2">
              <Info className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {submittedProposal ? (
            /* Confirmation Screen */
            <div className="py-6 px-4 text-center space-y-6">
              <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto ring-8 ring-teal-50/50">
                <CheckCircle2 className="w-10 h-10 text-teal-600" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Proposal Successfully Received!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your proposal has been logged with the SCINS Media International Scientific Steering Committee. An official acknowledgment has been dispatched to <span className="font-bold text-slate-900">{submittedProposal.proposer_email}</span>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 max-w-lg mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Proposal Tracking Code:</span>
                  <span className="font-mono font-bold text-teal-800">{submittedProposal.proposal_code}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Format Track:</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {submittedProposal.proposal_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Selected Congress:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                    {submittedProposal.conference_title}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Session Title:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                    {submittedProposal.title}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Peer Review Decision:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Within 5–7 Business Days
                  </span>
                </div>
              </div>

              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl max-w-lg mx-auto text-left text-xs space-y-1.5 text-teal-900">
                <div className="font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <span>Next Steps for Accepted Chairs & Presenters:</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  1. Formal invitation letter issued for institutional funding and international Schengen/US/UK visa processing.<br />
                  2. Session room allocation with full audio-visual technical support.<br />
                  3. Inclusion of your abstract and workshop syllabus in Scopus-indexed conference proceedings.
                </p>
              </div>

              <div className="pt-2 flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#0A2540] hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Return to Congress Portal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* STEP 1: Track & Destination */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 font-mono">
                      Select Proposal Track
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tracks.map(t => {
                        const Icon = t.icon;
                        const isSel = proposalType === t.type;
                        return (
                          <div
                            key={t.type}
                            onClick={() => {
                              setProposalType(t.type);
                              if (t.type === 'keynote_forum') setDurationFormat('45-Minute Plenary Keynote Address + 15-Min Q&A');
                              else if (t.type === 'workshop') setDurationFormat('90-Minute Interactive Masterclass');
                              else if (t.type === 'poster') setDurationFormat('Poster Display Board (A0) + 3-Min Lightning Pitch');
                              else if (t.type === 'symposium') setDurationFormat('90-Minute Thematic Multi-Speaker Panel');
                            }}
                            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                              isSel
                                ? 'border-teal-700 bg-teal-50/50 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${isSel ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-slate-900">{t.title}</span>
                                <span className="text-[9px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded font-mono">
                                  {t.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-snug">{t.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                      Target World Conference
                    </label>
                    <select
                      value={selectedConfId}
                      onChange={e => setSelectedConfId(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                    >
                      {conferences.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.title} — {c.city}, {c.country} ({c.start_date.slice(0, 7)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedConf && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span>Venue: {selectedConf.venue}, {selectedConf.city}, {selectedConf.country}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Dates: {selectedConf.start_date} to {selectedConf.end_date} • Mode: {selectedConf.mode}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 bg-[#0A2540] hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <span>Next: Proposer Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Proposer Profile */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                      <select
                        value={proposerTitle}
                        onChange={e => setProposerTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                      >
                        <option value="Prof.">Prof.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Assoc. Prof.">Assoc. Prof.</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Prof. Alexandra Dupont, Ph.D."
                        value={proposerName}
                        onChange={e => setProposerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Institutional Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g., a.dupont@sorbonne.fr"
                        value={proposerEmail}
                        onChange={e => setProposerEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., +33 1 40 46 22 11"
                        value={proposerPhone}
                        onChange={e => setProposerPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Affiliation / University / Organization <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Sorbonne Université & CNRS"
                        value={proposerAffiliation}
                        onChange={e => setProposerAffiliation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={proposerCountry}
                        onChange={e => setProposerCountry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Co-Presenters / Co-Chairs (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Dr. Kenji Sato (RIKEN Japan), Dr. Robert Davis (MIT)"
                      value={coPresenters}
                      onChange={e => setCoPresenters(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Short Proposer Biography (Max 120 words)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Summary of research focus, recent publications, and past keynote/workshop chairing credentials..."
                      value={proposerBio}
                      onChange={e => setProposerBio(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!proposerName.trim() || !proposerEmail.trim() || !proposerAffiliation.trim()) {
                          setErrorMsg('Please provide your Full Name, Email, and Affiliation.');
                          return;
                        }
                        setErrorMsg('');
                        setStep(3);
                      }}
                      className="px-5 py-2.5 bg-[#0A2540] hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <span>Next: Proposal Curriculum</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Proposal Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Proposed Session / Paper Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Advanced CRISPR-Cas12 Diagnostics for Rapid Pathogen Detection in Point-of-Care Settings"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Abstract / Proposal Description (300–500 words) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Provide comprehensive overview of the workshop curriculum, keynote lecture scope, or poster scientific findings..."
                      value={abstractText}
                      onChange={e => setAbstractText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Learning Objectives / Key Takeaways
                      </label>
                      <textarea
                        rows={2}
                        placeholder="1. Objective one&#10;2. Objective two&#10;3. Expected outcome"
                        value={learningObjectives}
                        onChange={e => setLearningObjectives(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Audience & Prerequisites
                      </label>
                      <textarea
                        rows={2}
                        value={targetAudience}
                        onChange={e => setTargetAudience(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Session Duration / Preferred Timing
                      </label>
                      <input
                        type="text"
                        value={durationFormat}
                        onChange={e => setDurationFormat(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        AV / Technical Equipment Needed
                      </label>
                      <input
                        type="text"
                        value={avRequirements}
                        onChange={e => setAvRequirements(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-teal-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload Draft Outline, Syllabus or CV (PDF, DOCX)
                    </label>
                    <div className="border border-dashed border-slate-300 hover:border-teal-600 rounded-2xl p-4 text-center bg-slate-50 hover:bg-white transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1 text-xs">
                        <Upload className="w-5 h-5 text-teal-700" />
                        <span className="font-semibold text-slate-700">
                          {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Click or drag syllabus / slides to attach'}
                        </span>
                        <span className="text-[10px] text-slate-400">PDF, DOCX up to 25MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                      <span>{isSubmitting ? 'Registering Proposal...' : 'Submit Proposal for Review'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
