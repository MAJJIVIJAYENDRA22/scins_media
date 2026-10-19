import React from 'react';
import { X } from 'lucide-react';
import { Conference } from '../types';
import { RegistrationPage } from '../pages/RegistrationPage';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference;
  initialCategoryId?: number;
  onNavigate?: (path: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  conference,
  initialCategoryId,
  onNavigate
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delegate-registration-modal"
      className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 z-30 p-2 sm:p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer bg-white/90 shadow-xs border border-slate-200/60"
          aria-label="Close registration modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-3 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]">
          <RegistrationPage
            conference={conference}
            initialConferenceSlug={conference.slug}
            initialCategoryId={initialCategoryId}
            lockConference={true}
            isModal={true}
            onClose={onClose}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};
