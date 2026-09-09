import React from 'react';
import { X, Clock, MapPin, Tag, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { Session } from '../types';

interface SessionDetailModalProps {
  session: Session | null;
  onClose: () => void;
  onSubmitAbstractForSession: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  onClose,
  onSubmitAbstractForSession
}) => {
  if (!session) return null;

  return (
    <div
      id="session-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#0A2540] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-950 border border-teal-800/80 px-2.5 py-0.5 rounded">
              {session.session_code}
            </span>
            <span className="text-xs text-slate-300">• Track: {session.track}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-display text-white leading-snug">
            {session.title}
          </h3>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#14B8A6]" />
              {session.session_date} | {session.start_time} - {session.end_time}
            </span>
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#14B8A6]" />
              {session.room}
            </span>
            <span className="bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded text-[11px]">
              {session.session_type}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Scope & Scientific Significance
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{session.description}</p>
          </div>

          {/* Key Topics & Sub-Tracks */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Key Focus Areas & Accepted Topics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                'Molecular synthesis & degradation pathways'
              ].map((topic, idx) => (
                <div key={idx} className="flex items-start text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-[#0E7490] mr-2 flex-shrink-0 mt-0.5" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-50/60 border border-teal-200/70 p-4 rounded-2xl text-xs text-teal-900 leading-relaxed">
            <span className="font-semibold text-teal-950">Publication Track:</span> Accepted papers presented in this session will be eligible for inclusion in the Scopus-indexed Special Issue of <i>Polymer Degradation and Stability (Elsevier)</i>.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onSubmitAbstractForSession();
            }}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-[#0A2540] hover:bg-[#0E7490] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Submit Abstract to This Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
