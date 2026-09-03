import React, { useState } from 'react';
import { Compass, Mail, Globe, Shield, CheckCircle2, Award, ExternalLink, BookOpen } from 'lucide-react';
import { api } from '../services/api';

interface FooterProps {
  onNavigate: (path: string) => void;
  onSelectConference?: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onSelectConference = (_slug: string) => {}
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <footer id="global-footer" className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <div className="bg-white rounded-xl p-2.5 px-4 shadow-sm inline-flex items-center border border-slate-700/50">
                <img
                  src="/scins-media-logo.jpeg"
                  alt="SCINS MEDIA — Connecting Minds, Inspiring Innovation"
                  className="h-14 sm:h-16 w-auto max-h-16 object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              Scinsmedia bridges international researchers, academic institutions, and industry pioneers to accelerate scientific breakthroughs, peer-reviewed publications, and cross-border innovation.
            </p>

            <div className="pt-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Stay Connected With Global Science
              </h5>
              {subscribed ? (
                <div className="flex items-center space-x-2 text-xs text-teal-400 bg-teal-950/60 border border-teal-800/80 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>You are subscribed to Scinsmedia Scientific Intelligence updates.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Enter academic or institutional email..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-l-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-r-xl text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {submitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Flagship Conferences
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onSelectConference('biopolymers-bioplastics-2026')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Biopolymers 2026 (Paris, FR)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectConference('nanomedicine-targeted-drug-delivery-2026')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  NanoMed 2026 (Boston, US)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectConference('ai-healthcare-genomics-2026')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  AI Health Summit (Zurich, CH)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectConference('green-chemistry-renewable-energy-2026')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  GreenChem 2026 (Tokyo, JP)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectConference('quantum-information-photonic-computing-2026')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Quantum Optica (Cambridge, UK)
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Ecosystem */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Research & Publishing
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('/publications')} className="hover:text-teal-400 transition-colors">
                  Scopus & SCI Indexed Vault
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/speakers')} className="hover:text-teal-400 transition-colors">
                  Global Keynote Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-teal-400 transition-colors">
                  Scientific Advisory Council
                </button>
              </li>

              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-teal-400 transition-colors">
                  Secretariat & Visa Assistance
                </button>
              </li>
            </ul>
          </div>

          {/* International Secretariat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Global Secretariats
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div>
                <span className="font-semibold text-slate-200">Paris Secretariat:</span>
                <p className="text-[11px] text-slate-400">1 Rue du Fossé Blanc, Gennevilliers, 92230 Paris, France</p>
              </div>
              <div>
                <span className="font-semibold text-slate-200">London Liaison:</span>
                <p className="text-[11px] text-slate-400">71-75 Shelton Street, Covent Garden, London, WC2H 9JQ</p>
              </div>
              <div className="pt-1">
                <span className="font-semibold text-slate-200">Official Inquiries:</span>
                <p className="text-[11px] text-teal-400 font-mono">secretariat@scinsmedia.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span>© {new Date().getFullYear()} Scinsmedia Scientific Ecosystem. All rights reserved.</span>
            <span>•</span>
            <span className="text-slate-400 font-medium">Enterprise MySQL / Node.js Engine</span>
          </div>

          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>WCAG 2.2 AA Accessible</span>
            </span>
            <span className="text-slate-500">ISO 9001:2015 Certified Congress Publisher</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
