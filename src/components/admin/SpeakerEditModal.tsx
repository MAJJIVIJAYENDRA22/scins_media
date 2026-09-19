// =============================================================================
// SCINSMEDIA — Speaker Edit & Create Modal Component
// Full CMS management of keynote/plenary speakers, presentation abstracts & metrics
// =============================================================================

import React, { useState, useEffect } from 'react';
import { X, Save, Mic, Building, MapPin, Award, BookOpen, Globe, Link2, Sparkles } from 'lucide-react';
import { Speaker } from '../../types';
import { MediaUploadInput } from './MediaUploadInput';

interface SpeakerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  speaker: Partial<Speaker> | null;
  onSave: (speaker: Speaker) => void;
  conferenceDomain?: string;
}

const SPEAKER_TYPES = [
  'Keynote',
  'Plenary',
  'Featured',
  'Invited Speaker',
  'Oral Presenter',
  'Session Chair'
];

export const SpeakerEditModal: React.FC<SpeakerEditModalProps> = ({
  isOpen,
  onClose,
  speaker,
  onSave,
  conferenceDomain = 'Scientific Research'
}) => {
  const [formData, setFormData] = useState<Partial<Speaker>>({
    name: '',
    prefix: 'Prof.',
    designation: '',
    institution: '',
    country: '',
    speaker_type: 'Keynote',
    presentation_title: '',
    presentation_abstract: '',
    research_domain: conferenceDomain,
    photo_url: '',
    biography: '',
    h_index: 35,
    citations_count: 1500,
    linkedin_url: '',
    google_scholar: '',
    website: '',
    display_order: 1,
    is_active: true
  });

  useEffect(() => {
    if (speaker) {
      setFormData({
        ...speaker,
        name: speaker.name || '',
        prefix: speaker.prefix || 'Prof.',
        designation: speaker.designation || '',
        institution: speaker.institution || '',
        country: speaker.country || '',
        speaker_type: speaker.speaker_type || 'Keynote',
        presentation_title: speaker.presentation_title || '',
        presentation_abstract: speaker.presentation_abstract || '',
        research_domain: speaker.research_domain || conferenceDomain,
        photo_url: speaker.photo_url || '',
        biography: speaker.biography || '',
        h_index: speaker.h_index ?? 35,
        citations_count: speaker.citations_count ?? 1500,
        linkedin_url: speaker.linkedin_url || '',
        google_scholar: speaker.google_scholar || '',
        website: speaker.website || '',
        display_order: speaker.display_order ?? 1,
        is_active: speaker.is_active !== false
      });
    }
  }, [speaker, isOpen, conferenceDomain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: formData.id || Date.now(),
      name: formData.name || 'Speaker Name',
      prefix: formData.prefix || 'Dr.',
      designation: formData.designation || 'Keynote Faculty',
      institution: formData.institution || 'University / Academic Institute',
      country: formData.country || 'Global',
      speaker_type: formData.speaker_type || 'Keynote',
      presentation_title: formData.presentation_title || `Keynote Address on ${conferenceDomain}`,
      presentation_abstract: formData.presentation_abstract || '',
      research_domain: formData.research_domain || conferenceDomain,
      photo_url: formData.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      biography: formData.biography || '',
      h_index: Number(formData.h_index ?? 25),
      citations_count: Number(formData.citations_count ?? 1200),
      linkedin_url: formData.linkedin_url || '',
      google_scholar: formData.google_scholar || '',
      website: formData.website || '',
      display_order: Number(formData.display_order || 1),
      is_active: formData.is_active !== false,
      status: formData.is_active !== false ? 'active' : 'inactive'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-2xs font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {formData.id ? 'Edit Conference Speaker' : 'Add Conference Speaker'}
              </h3>
              <p className="text-xs text-slate-500">Configure speaker presentation, academic qualifications, photo, and metrics.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Row 1: Profile Photo */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Speaker Photo / Portrait
            </label>
            <MediaUploadInput
              value={formData.photo_url || ''}
              onChange={url => setFormData({ ...formData, photo_url: url })}
              category="speakers"
              placeholder="https://images.unsplash.com/..."
              helperText="Upload a speaker headshot or select from media library."
              showMediaLibrary={true}
              showUrlToggle={true}
            />
          </div>

          {/* Row 2: Prefix, Name, Speaker Type */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Prefix</label>
              <select
                value={formData.prefix || 'Prof.'}
                onChange={e => setFormData({ ...formData, prefix: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="Prof.">Prof.</option>
                <option value="Dr.">Dr.</option>
                <option value="Assoc. Prof.">Assoc. Prof.</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Eleanor Vance"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Speaker Type</label>
              <select
                value={formData.speaker_type || 'Keynote'}
                onChange={e => setFormData({ ...formData, speaker_type: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                {SPEAKER_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Designation, Institution, Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Designation / Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.designation || ''}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Director of Quantum Laboratory"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Institution / University <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.institution || ''}
                onChange={e => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g. Stanford University"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.country || ''}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. United States"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Row 4: Presentation Details */}
          <div className="space-y-3 p-4 bg-teal-50/40 rounded-2xl border border-teal-100">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-900">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Presentation Information</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Presentation / Talk Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.presentation_title || ''}
                onChange={e => setFormData({ ...formData, presentation_title: e.target.value })}
                placeholder="e.g. Quantum Error Mitigation in High-Coherence Superconducting Qubits"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Presentation Abstract
              </label>
              <textarea
                rows={3}
                value={formData.presentation_abstract || ''}
                onChange={e => setFormData({ ...formData, presentation_abstract: e.target.value })}
                placeholder="Executive abstract of the presentation topic, research background, methodologies and findings..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Row 5: Biography */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Speaker Biography
            </label>
            <textarea
              rows={3}
              value={formData.biography || ''}
              onChange={e => setFormData({ ...formData, biography: e.target.value })}
              placeholder="Career background, key research contributions, fellowships, and academic accolades..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Row 6: Metrics & Ordering */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">h-Index</label>
              <input
                type="number"
                min="0"
                value={formData.h_index ?? 30}
                onChange={e => setFormData({ ...formData, h_index: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Citations Count</label>
              <input
                type="number"
                min="0"
                value={formData.citations_count ?? 1000}
                onChange={e => setFormData({ ...formData, citations_count: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Research Domain</label>
              <input
                type="text"
                value={formData.research_domain || ''}
                onChange={e => setFormData({ ...formData, research_domain: e.target.value })}
                placeholder="e.g. Quantum Computing"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Display Order</label>
              <input
                type="number"
                min="1"
                value={formData.display_order ?? 1}
                onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Row 7: Academic Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={formData.linkedin_url || ''}
                onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Google Scholar</label>
              <input
                type="text"
                value={formData.google_scholar || ''}
                onChange={e => setFormData({ ...formData, google_scholar: e.target.value })}
                placeholder="https://scholar.google.com/..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Personal Website</label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Row 8: Active Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_active_toggle"
              checked={formData.is_active !== false}
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="is_active_toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Active and visible in public keynote lineup
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{formData.id ? 'Update Speaker' : 'Save Speaker'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
