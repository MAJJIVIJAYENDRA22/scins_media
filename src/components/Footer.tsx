import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  Building,
  MapPin,
  Mail
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

  const handleLink = (eOrPath: React.MouseEvent | string, maybePath?: string) => {
    const path = typeof eOrPath === 'string' ? eOrPath : (maybePath || '');
    if (typeof eOrPath !== 'string' && eOrPath && !eOrPath.ctrlKey && !eOrPath.metaKey && eOrPath.button === 0) {
      eOrPath.preventDefault();
    }
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
            <div className="flex items-center">
              <span className="text-lg font-bold text-white tracking-wide font-display">
                SCINS MEDIA
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              SCINS MEDIA connects researchers, healthcare professionals, and industry experts through international conferences, scientific collaboration, and research publication opportunities, fostering knowledge exchange, interdisciplinary innovation, and global academic advancement.
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
                <a
                  href="/conferences"
                  onClick={(e) => handleLink(e, '/conferences')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer inline-block"
                >
                  All Conferences 2026
                </a>
              </li>
              <li>
                <a
                  href="/conferences"
                  onClick={(e) => handleLink(e, '/conferences')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer inline-block"
                >
                  Call for Abstracts
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleLink(e, '/about')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer inline-block"
                >
                  Scientific Advisory Board
                </a>
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
                <a
                  href={`/conferences/${upcomingConferenceSlug}#registration-section`}
                  onClick={(e) => handleLink(e, `/conferences/${upcomingConferenceSlug}#registration-section`)}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer flex items-center space-x-1"
                >
                  <span>Conference Registration</span>
                  <span className="text-[10px] bg-teal-900 text-teal-300 px-1.5 py-0.5 rounded font-mono">Live</span>
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleLink(e, '/contact')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer inline-block"
                >
                  Visa Support Letters
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleLink(e, '/contact')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer inline-block"
                >
                  Institutional Bank Transfer / Invoice
                </a>
              </li>
              <li>
                <a
                  href="/terms-and-conditions"
                  onClick={(e) => handleLink(e, '/terms-and-conditions')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer inline-block"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Secretariat & Location (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Secretariat & Location</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="font-bold text-slate-100 font-display text-sm tracking-tight">
                European Secretariat
              </div>
              <div className="flex items-start space-x-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>{orgInfo.headquarters_location || 'Estonia, Europe'}</span>
              </div>
              <div className="flex items-center space-x-2 pt-0.5">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <a
                  href={`mailto:${orgInfo.secretariat_email || 'scinsmedia@gmail.com'}`}
                  className="text-teal-400 hover:text-teal-300 transition-colors font-medium hover:underline"
                >
                  {orgInfo.secretariat_email || 'scinsmedia@gmail.com'}
                </a>
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
            <button
              type="button"
              onClick={() => handleLink('/about')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              About
            </button>
            <span>•</span>
            <a
              href="/terms-and-conditions"
              onClick={(e) => handleLink(e, '/terms-and-conditions')}
              className="hover:text-slate-200 transition-colors cursor-pointer inline-block"
            >
              Terms & Conditions
            </a>
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
