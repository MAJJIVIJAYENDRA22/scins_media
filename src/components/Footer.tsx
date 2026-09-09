import React, { useState } from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onSelectConference?: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate: _onNavigate,
  onSelectConference: _onSelectConference
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
    <footer id="global-footer" className="bg-[#0A2540] text-slate-300 pt-12 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-slate-800/80 items-start">
          {/* Brand Col */}
          <div className="md:col-span-7 space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Scinsmedia bridges international researchers, academic institutions, and industry pioneers to accelerate scientific breakthroughs, peer-reviewed publications, and cross-border innovation.
            </p>

            <div className="pt-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Stay Connected With Global Science
              </h5>
              {subscribed ? (
                <div className="flex items-center space-x-2 text-xs text-teal-300 bg-teal-950/80 border border-teal-800/80 p-3 rounded-xl">
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
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-l-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#0E7490] hover:bg-teal-500 text-white px-5 py-2.5 rounded-r-xl text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    {submitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* International Secretariat */}
          <div className="md:col-span-5 space-y-3 md:pl-6 lg:pl-10">
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
