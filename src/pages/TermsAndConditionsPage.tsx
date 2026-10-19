import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Scale } from 'lucide-react';
import { TermsContent } from '../types';
import { INITIAL_TERMS_CONTENT } from '../data/initialData';
import { api } from '../services/api';

interface TermsAndConditionsPageProps {
  onNavigate?: (path: string) => void;
}

export const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({ onNavigate }) => {
  const [content, setContent] = useState<TermsContent>(INITIAL_TERMS_CONTENT);

  useEffect(() => {
    let isMounted = true;
    api.getTerms()
      .then(res => {
        if (isMounted && res && res.data && Array.isArray(res.data.sections)) {
          setContent(res.data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch terms from backend, using default baseline:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLink = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to format text with mailto links or contact links
  const renderPointText = (text: string) => {
    if (!text) return null;

    // Detect email
    if (text.includes('scinsmedia@gmail.com')) {
      const parts = text.split('scinsmedia@gmail.com');
      return (
        <span>
          {parts[0]}
          <a href="mailto:scinsmedia@gmail.com" className="text-teal-600 font-medium hover:underline">
            scinsmedia@gmail.com
          </a>
          {parts[1] && parts[1].includes('Contact Page') ? (
            <span>
              {parts[1].split('Contact Page')[0]}
              <button
                type="button"
                onClick={() => handleLink('/contact')}
                className="text-teal-600 font-medium hover:underline cursor-pointer"
              >
                Contact Page
              </button>
              {parts[1].split('Contact Page')[1]}
            </span>
          ) : (
            parts[1]
          )}
        </span>
      );
    }

    return text;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb / Back button */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={() => handleLink('/')}
            className="hover:text-teal-600 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{content.title || 'Terms & Conditions'}</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-[#0A2540] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-tr from-teal-900/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800/80 inline-flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>{content.badge || 'Legal & Institutional Framework'}</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
              {content.title || 'Terms & Conditions'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {content.description ||
                'Please review the terms and regulations governing conference participation, delegate registrations, abstract submissions, publication services, and portal usage under SCINS Media.'}
            </p>
            <div className="pt-2 text-xs text-slate-400 font-mono">
              {content.effective_date || 'Effective Date: January 1, 2026 • Version 2.4'}
            </div>
          </div>
        </div>

        {/* Terms Content Sections */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10 space-y-10 text-slate-700 text-sm leading-relaxed">
          {content.sections && content.sections.length > 0 ? (
            content.sections.map((section, idx) => (
              <React.Fragment key={section.id || idx}>
                {idx > 0 && <hr className="border-slate-100" />}
                <section className="space-y-3">
                  <div className="flex items-center space-x-2.5 text-slate-900">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-100 font-mono shrink-0">
                      {idx + 1}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                      {section.heading}
                    </h2>
                  </div>

                  <div className="text-slate-600 pl-9 space-y-2.5">
                    {section.points && section.points.length > 0 ? (
                      section.points.length === 1 ? (
                        <p>{renderPointText(section.points[0])}</p>
                      ) : (
                        <>
                          {/* First point as intro paragraph */}
                          <p>{renderPointText(section.points[0])}</p>
                          {/* Remaining points as styled bullet items */}
                          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                            {section.points.slice(1).map((pt, pIdx) => (
                              <li key={pIdx}>{renderPointText(pt)}</li>
                            ))}
                          </ul>
                        </>
                      )
                    ) : (
                      <p className="text-slate-400 italic">No clause content defined.</p>
                    )}
                  </div>
                </section>
              </React.Fragment>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              No Terms & Conditions sections available.
            </div>
          )}
        </div>

        {/* Bottom Navigation Assist */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Dedicated to transparent, ethical international scholarly exchange.</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => handleLink('/about')}
              className="text-slate-700 hover:text-teal-600 font-medium transition-colors cursor-pointer"
            >
              Institutional Charter
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => handleLink('/conferences')}
              className="text-slate-700 hover:text-teal-600 font-medium transition-colors cursor-pointer"
            >
              Browse Conferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
