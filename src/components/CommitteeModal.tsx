import React from 'react';
import { X, BookOpen, GraduationCap, Briefcase, Award, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { CommitteeMember } from '../types';

interface CommitteeModalProps {
  member: CommitteeMember | null;
  onClose: () => void;
}

export const CommitteeModal: React.FC<CommitteeModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <div
      id="committee-member-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Photo + Bio Bar */}
        <div className="relative bg-gradient-to-r from-[#0A2540] to-teal-950 p-6 sm:p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
            <img
              src={member.photo_url}
              alt={member.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-teal-400/50 shadow-xl flex-shrink-0"
            />
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-900/60 px-2.5 py-0.5 rounded-full border border-teal-500/30 inline-block">
                {member.committee_role}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                {member.name}
              </h3>
              <p className="text-xs text-teal-200">{member.designation}</p>
              <p className="text-xs text-slate-300 font-medium">
                {member.institution} • {member.country}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Biography */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-[#0E7490] mr-1.5" />
              Academic Biography
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{member.biography}</p>
          </div>

          {/* Research Interests */}
          {member.research_interests && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Primary Research Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {member.research_interests.split(',').map((interest, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold text-[#0E7490] bg-teal-50 border border-teal-200/70 px-3 py-1 rounded-xl"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {member.education && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-xs font-bold text-slate-900 flex items-center">
                  <GraduationCap className="w-4 h-4 text-teal-600 mr-1.5" />
                  <span>Education</span>
                </div>
                <p className="text-xs text-slate-600">{member.education}</p>
              </div>
            )}
            {member.experience && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-xs font-bold text-slate-900 flex items-center">
                  <Briefcase className="w-4 h-4 text-teal-600 mr-1.5" />
                  <span>Experience</span>
                </div>
                <p className="text-xs text-slate-600">{member.experience}</p>
              </div>
            )}
          </div>

          {/* Metrics & External Profiles */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              <b>{member.publications_count}+</b> Peer-Reviewed Publications
            </div>

            <div className="flex items-center space-x-3">
              {member.orcid_url && (
                <a
                  href={member.orcid_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>ORCID</span>
                </a>
              )}
              {member.linkedin_url && (
                <a
                  href={member.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Scholar / Bio</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
