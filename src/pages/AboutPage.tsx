import React, { useState, useEffect } from 'react';
import { Compass, ShieldCheck, Globe, Users, Award, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { INITIAL_ORGANIZATION_INFO, OrganizationLocationInfo } from '../data/initialData';

export const AboutPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [orgInfo, setOrgInfo] = useState<OrganizationLocationInfo>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('scins_organization_info') : null;
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ORGANIZATION_INFO;
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('scins_organization_info');
        if (saved) setOrgInfo(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('scins_organization_updated', handleUpdate);
    return () => window.removeEventListener('scins_organization_updated', handleUpdate);
  }, []);
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Banner */}
        <div className="bg-[#0A2540] rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-tr from-teal-900/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800/80 inline-block">
                Institutional Charter
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
              Pioneering the Future of Global Scientific Exchange
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              SCINS Media serves as an independent international congress organizer, publisher, and scientific collaboration platform dedicated to peer-reviewed excellence, open scientific inquiry, and global innovation.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Uncompromising Peer Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every abstract submitted to a SCINS Media congress undergoes rigorous peer review by an international committee of distinguished university professors and leading subject-matter specialists.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Global Academic Inclusivity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Convening delegations from over 170 countries, we ensure researchers from emerging economies, early-career scholars, and distinguished global luminaries share an equal voice and collaborative platform.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Indexed DOI Dissemination</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Collaborating with premier international publishers and indexed journals ensures high-quality contributions reach global citation networks, securing lasting academic impact for participating scholars.
            </p>
          </div>
        </div>

        {/* Governance & Secretariats */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <h2 className="text-2xl font-bold font-display text-slate-900">
            International Secretariat & Academic Council
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Our international secretariat coordinates congress logistics, speaker hospitality, official visa support documentation, venue management, and global publisher relations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90">
              <h4 className="text-xs font-bold text-slate-900 font-display">{orgInfo.headquarters_title || 'European Secretariat & Headquarters'}</h4>
              <p className="text-xs text-slate-500 mt-1">{orgInfo.headquarters_location || 'Estonia, Europe'}</p>
              <p className="text-xs text-[#0E7490] font-mono font-medium mt-1">{orgInfo.secretariat_email || 'scinsmedia@gmail.com'}</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90">
              <h4 className="text-xs font-bold text-slate-900 font-display">{orgInfo.editorial_title || 'Editorial & Publications Directorate'}</h4>
              <p className="text-xs text-slate-500 mt-1">{orgInfo.editorial_location || 'Estonia, Europe'}</p>
              <p className="text-xs text-[#0E7490] font-mono font-medium mt-1">{orgInfo.editorial_email || 'scinsmedia@gmail.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
