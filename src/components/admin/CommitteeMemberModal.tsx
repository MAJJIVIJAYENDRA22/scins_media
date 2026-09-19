// =============================================================================
// SCINSMEDIA — Committee Member Edit & Create Modal Component
// Full CMS management of all fields, categories, image uploads & profile data
// =============================================================================

import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, MapPin, Award, BookOpen, Globe, Link2, Check } from 'lucide-react';
import { CommitteeMember } from '../../types';
import { MediaUploadInput } from './MediaUploadInput';

interface CommitteeMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Partial<CommitteeMember> | null;
  onSave: (member: CommitteeMember) => void;
  existingCategories?: string[];
}

const DEFAULT_ROLES = [
  'Organizing Committee',
  'Editorial Board',
  'Conference Chair',
  'Honorary Chair',
  'General Chair',
  'Co-Chair',
  'Scientific Committee',
  'Advisory Board',
  'Program Committee'
];

export const CommitteeMemberModal: React.FC<CommitteeMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  existingCategories = []
}) => {
  const [formData, setFormData] = useState<Partial<CommitteeMember>>({
    name: '',
    designation: '',
    institution: '',
    country: '',
    committee_role: 'Scientific Committee',
    photo_url: '',
    biography: '',
    education: '',
    experience: '',
    research_interests: '',
    publications_count: 0,
    linkedin_url: '',
    orcid_url: '',
    google_scholar_url: '',
    display_order: 1,
    is_published: true
  });

  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        name: member.name || '',
        designation: member.designation || '',
        institution: member.institution || '',
        country: member.country || '',
        committee_role: member.committee_role || 'Scientific Committee',
        photo_url: member.photo_url || '',
        biography: member.biography || '',
        education: member.education || '',
        experience: member.experience || '',
        research_interests: member.research_interests || '',
        publications_count: member.publications_count || 0,
        linkedin_url: member.linkedin_url || '',
        orcid_url: member.orcid_url || '',
        google_scholar_url: member.google_scholar_url || '',
        display_order: member.display_order ?? 1,
        is_published: member.is_published !== false
      });

      const role = member.committee_role || '';
      if (role && !DEFAULT_ROLES.includes(role)) {
        setIsCustomRole(true);
        setCustomRoleText(role);
      } else {
        setIsCustomRole(false);
        setCustomRoleText('');
      }
    }
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = isCustomRole && customRoleText.trim()
      ? customRoleText.trim()
      : formData.committee_role || 'Scientific Committee';

    onSave({
      id: formData.id || Date.now(),
      conference_id: formData.conference_id || 1,
      name: formData.name || 'Dr. Committee Member',
      designation: formData.designation || 'Faculty Member',
      institution: formData.institution || 'University / Academic Institute',
      country: formData.country || 'Global',
      committee_role: finalRole,
      photo_url: formData.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      biography: formData.biography || '',
      education: formData.education || '',
      experience: formData.experience || '',
      research_interests: formData.research_interests || '',
      publications_count: Number(formData.publications_count || 0),
      linkedin_url: formData.linkedin_url || '',
      orcid_url: formData.orcid_url || '',
      google_scholar_url: formData.google_scholar_url || '',
      display_order: Number(formData.display_order || 1),
      is_published: formData.is_published !== false,
      status: formData.is_published !== false ? 'active' : 'inactive'
    });
    onClose();
  };

  const combinedRoles = Array.from(new Set([...DEFAULT_ROLES, ...existingCategories]));

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
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {formData.id ? 'Edit Committee / Editorial Member' : 'Add Committee / Editorial Member'}
              </h3>
              <p className="text-xs text-slate-500">Configure academic details, biography, research domains, and profile portrait.</p>
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
          {/* Row 1: Profile Photo (with Media Library & Direct URL support) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Profile Photo / Portrait
            </label>
            <MediaUploadInput
              value={formData.photo_url || ''}
              onChange={url => setFormData({ ...formData, photo_url: url })}
              category="committee"
              placeholder="https://images.unsplash.com/..."
              helperText="Upload a high-resolution portrait or select from previously uploaded media."
              showMediaLibrary={true}
              showUrlToggle={true}
            />
          </div>

          {/* Row 2: Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Full Name & Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Prof. David Miller, Ph.D."
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Academic Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.designation || ''}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Chair Professor of Condensed Matter"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Row 3: Institution & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Institution / University / Organization <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.institution || ''}
                onChange={e => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g. University of Cambridge"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Country / Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.country || ''}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. United Kingdom"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Row 4: Committee Role / Category & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Committee Role / Category <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomRole(!isCustomRole)}
                  className="text-[11px] text-teal-800 hover:text-teal-900 font-semibold cursor-pointer"
                >
                  {isCustomRole ? 'Choose Preset Role' : '+ Custom Category'}
                </button>
              </div>

              {isCustomRole ? (
                <input
                  type="text"
                  value={customRoleText}
                  onChange={e => setCustomRoleText(e.target.value)}
                  placeholder="Enter custom committee role (e.g. Senior Editorial Fellow)"
                  className="w-full bg-white border border-teal-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20"
                />
              ) : (
                <select
                  value={formData.committee_role || 'Scientific Committee'}
                  onChange={e => setFormData({ ...formData, committee_role: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {combinedRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              )}
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

          {/* Row 5: Biography */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Biography & Academic Background
            </label>
            <textarea
              rows={3}
              value={formData.biography || ''}
              onChange={e => setFormData({ ...formData, biography: e.target.value })}
              placeholder="Provide a comprehensive academic bio, research achievements, notable awards, or leadership contributions..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Row 6: Research Interests & Publications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">Research Interests / Domain</label>
              <input
                type="text"
                value={formData.research_interests || ''}
                onChange={e => setFormData({ ...formData, research_interests: e.target.value })}
                placeholder="e.g. Quantum Spintronics, Topological Insulators"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Publications Count</label>
              <input
                type="number"
                min="0"
                value={formData.publications_count || 0}
                onChange={e => setFormData({ ...formData, publications_count: Number(e.target.value) })}
                placeholder="e.g. 85"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Row 7: Academic Profile Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">LinkedIn Profile URL</label>
              <input
                type="text"
                value={formData.linkedin_url || ''}
                onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Google Scholar URL</label>
              <input
                type="text"
                value={formData.google_scholar_url || ''}
                onChange={e => setFormData({ ...formData, google_scholar_url: e.target.value })}
                placeholder="https://scholar.google.com/..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">ORCID ID URL</label>
              <input
                type="text"
                value={formData.orcid_url || ''}
                onChange={e => setFormData({ ...formData, orcid_url: e.target.value })}
                placeholder="https://orcid.org/0000-..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Row 8: Status Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_published_toggle"
              checked={formData.is_published !== false}
              onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="is_published_toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Publish on public conference website
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
              <span>{formData.id ? 'Update Member' : 'Save Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
