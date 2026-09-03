import React from 'react';
import { Compass, ShieldCheck, Globe, Users, Award, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-xl">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-xs inline-flex items-center">
                <img
                  src="/scins-media-logo.png"
                  alt="SCINS MEDIA"
                  className="h-12 sm:h-14 w-auto max-h-14 object-contain"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
                Institutional Charter
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white">
              Pioneering the Future of Global Scientific Exchange
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Scinsmedia serves as an independent international congress organizer, publisher, and scientific collaboration platform dedicated to peer-reviewed excellence, open science, and cross-border innovation.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Uncompromising Peer Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every abstract submitted to a Scinsmedia congress undergoes single-blind peer review by an international committee composed of tenured university professors and domain specialists.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Global Academic Inclusivity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              With delegations from 170+ countries, we ensure researchers from developing economies, early-career postdocs, and established luminaries share equal voice and platform.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Indexed DOI Dissemination</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Partnering with Elsevier, Springer, and Nature journals ensures that high-quality papers reach global citation networks, securing measurable academic impact for authors.
            </p>
          </div>
        </div>

        {/* Governance & Secretariats */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold font-display text-slate-900">
            International Secretariat & Academic Council
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Our permanent secretariats in Paris, London, and Zurich coordinate conference logistics, speaker hospitality, visa support documentation, venue production, and publisher relations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900">Paris Secretariat (European Headquarters)</h4>
              <p className="text-xs text-slate-500 mt-1">1 Rue du Fossé Blanc, Gennevilliers, 92230 Paris, France</p>
              <p className="text-xs text-teal-700 font-mono mt-1">paris.secretariat@scinsmedia.com</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900">London Liaison Office (Editorial & Publications)</h4>
              <p className="text-xs text-slate-500 mt-1">71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom</p>
              <p className="text-xs text-teal-700 font-mono mt-1">editorial@scinsmedia.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
