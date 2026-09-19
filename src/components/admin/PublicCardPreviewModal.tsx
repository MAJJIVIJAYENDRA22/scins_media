// =============================================================================
// SCINSMEDIA — Public Card Preview Modal Component
// Previews Committee Member or Speaker card exactly as shown on the public site
// =============================================================================

import React from 'react';
import { X, Eye, ExternalLink, Award, BookOpen, Globe, MapPin, Building, ChevronRight } from 'lucide-react';
import { CommitteeMember, Speaker } from '../../types';

interface PublicCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'committee' | 'speaker';
  data: Partial<CommitteeMember | Speaker> | null;
}

export const PublicCardPreviewModal: React.FC<PublicCardPreviewModalProps> = ({
  isOpen,
  onClose,
  type,
  data
}) => {
  if (!isOpen || !data) return null;

  const isCommittee = type === 'committee';
  const member = data as Partial<CommitteeMember>;
  const speaker = data as Partial<Speaker>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Preview Badge Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-2 text-teal-800 font-bold text-xs">
            <Eye className="w-4 h-4 text-teal-700" />
            <span>Public Website Live Preview</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Public Card Recreation */}
        <div className="p-6 bg-slate-50/50">
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-lg flex flex-col justify-between">
            <div className="p-6 text-center space-y-3">
              <img
                src={data.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={data.name}
                className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-teal-500/50 shadow"
              />
              <div>
                <span className="text-[10px] font-bold uppercase text-[#0E7490] bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full inline-block">
                  {isCommittee ? member.committee_role || 'Organizing Committee' : speaker.speaker_type || 'Keynote'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5 font-display">
                  {!isCommittee && speaker.prefix ? `${speaker.prefix} ` : ''}{data.name || 'Full Name'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{data.designation || 'Academic Role'}</p>
                <p className="text-xs text-slate-500 font-medium">{data.institution || 'University / Organization'}</p>
                {data.country && <p className="text-[11px] text-slate-400 mt-0.5">{data.country}</p>}

                {!isCommittee && speaker.presentation_title && (
                  <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left">
                    <span className="text-[10px] font-bold text-teal-800 uppercase block">Presentation:</span>
                    <p className="text-xs text-slate-800 font-semibold mt-0.5 line-clamp-2">{speaker.presentation_title}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-[#0E7490] font-semibold">
              <span>View Full Academic Profile</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Detailed Modal Content Preview */}
        {data.biography && (
          <div className="p-5 border-t border-slate-100 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Biography Preview</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-h-28 overflow-y-auto">
              {data.biography}
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
