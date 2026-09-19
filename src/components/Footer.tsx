import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  Calendar,
  BookOpen,
  UserCheck,
  CreditCard,
  Building,
  Mail,
  ExternalLink,
  ArrowRight,
  Globe
} from 'lucide-react';
import { api } from '../services/api';
import { INITIAL_ORGANIZATION_INFO, OrganizationLocationInfo } from '../data/initialData';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onSelectConference?: (slug: string) => void;
  upcomingConferenceSlug?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate = (_path: string) => {},
  onSelectConference: _onSelectConference,
  upcomingConferenceSlug = 'biopolymers-bioplastics-2026'
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [orgInfo, setOrgInfo] = useState<OrganizationLocationInfo>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('scins_organization_info') : null;
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ORGANIZATION_INFO;
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('scins_organization_info');
        if (saved) setOrgInfo(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('scins_organization_updated', handleUpdate);
    return () => window.removeEventListener('scins_organization_updated', handleUpdate);
  }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await api.subscribeNewsletter(email);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      setSubscribed(true); // graceful fallback
    } finally {
      setSubmitting(false);
    }
  };

  const handleLink = (path: string) => {
    onNavigate(path);
    if (!path.includes('#')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="global-footer" className="bg-[#0A192F] text-slate-300 pt-16 pb-12 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top 4-Column Ecosystem Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-800/80 items-start">
          {/* Col 1: Brand & Scientific Mission (5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 font-bold text-base font-display">
                S
              </div>
              <span className="text-lg font-bold text-white tracking-wide font-display">
                SCINS MEDIA
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              SCINS Media bridges international academic researchers, clinical investigators, and industrial pioneers to accelerate breakthrough discoveries, Elsevier Scopus-indexed publications, and cross-border innovation.
            </p>

            <div className="pt-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-200 mb-2 font-mono">
                Subscribe to Scientific Bulletins
              </h5>
              {subscribed ? (
                <div className="flex items-center space-x-2 text-xs text-teal-300 bg-teal-950/80 border border-teal-800/80 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Subscribed to SCINS Media Research Intelligence alerts.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex max-w-sm">
                  <input
                    type="email"
                    required
                    placeholder="Institutional email address..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-l-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded-r-xl text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer shadow-xs"
                  >
                    {submitting ? '...' : 'Join'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 2: Scientific Congresses (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Congresses</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/conferences')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  All Conferences 2026
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/speakers')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Distinguished Keynotes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/conferences')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Call for Abstracts
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/about')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Scientific Advisory Board
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Delegate & Registration (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-1.5">
              <CreditCard className="w-3.5 h-3.5 text-teal-400" />
              <span>Delegates & Authors</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => handleLink(`/conferences/${upcomingConferenceSlug}#registration-section`)}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer flex items-center space-x-1"
                >
                  <span>Conference Registration</span>
                  <span className="text-[10px] bg-teal-900 text-teal-300 px-1.5 py-0.5 rounded font-mono">Live</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/publications')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Peer-Reviewed Journals & Articles
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/contact')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Visa Support Letters
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/contact')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Institutional Bank Transfer / Invoice
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Secretariats & Administration (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-teal-400" />
              <span>Secretariat & Location</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div>
                <span className="font-semibold text-slate-200 block">European Secretariat:</span>
                <span className="text-[11px] text-slate-400 block">{orgInfo.headquarters_location || 'Estonia, Europe'}</span>
              </div>
              <div className="pt-1">
                <span className="text-[11px] text-teal-400 font-mono">{orgInfo.secretariat_email || 'scinsmedia@gmail.com'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Compliance & Database Engine */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 space-y-4 md:space-y-0 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} SCINS Media Scientific Ecosystem. All rights reserved.</span>
            <span>•</span>

          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center space-x-1 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>PCI-DSS & SSL Encrypted</span>
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleLink('/about')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Ethics & Malpractice Statement
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleLink('/contact')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
