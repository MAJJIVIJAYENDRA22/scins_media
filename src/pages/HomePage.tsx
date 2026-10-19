import React, { useMemo, useEffect } from 'react';
import {
  ArrowRight,
  Search,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { sortConferencesDynamically } from '../utils/dateUtils';
import { HeroVisual } from '../components/HeroVisual';
import { ConferenceCard } from '../components/ConferenceCard';
import { Conference, Speaker, Testimonial } from '../types';
import {
  INITIAL_CONFERENCES,
  SPEAKERS,
  TESTIMONIALS
} from '../data/initialData';

interface HomePageProps {
  conferences?: Conference[];
  speakers?: Speaker[];
  testimonials?: Testimonial[];
  onSelectConference?: (slug: string) => void;
  onNavigate?: (path: string) => void;
  onOpenSearch?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  conferences = INITIAL_CONFERENCES,
  speakers: _speakers = SPEAKERS,
  testimonials: _testimonials = TESTIMONIALS,
  onSelectConference = (_slug: string) => {},
  onNavigate = (_path: string) => {},
  onOpenSearch = () => {}
}) => {
  // Smooth scroll support on direct URL access or refresh with hash anchor
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.slice(1);
      const tryScroll = (retries = 8) => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else if (retries > 0) {
          setTimeout(() => tryScroll(retries - 1), 100);
        }
      };
      setTimeout(() => tryScroll(8), 120);
    }
  }, []);

  // Display upcoming conferences dynamically sorted by date
  const ongoingConferences = useMemo(() => {
    const published = conferences.filter(c => c.status === 'published' || !c.status);
    return sortConferencesDynamically(published).slice(0, 3);
  }, [conferences]);

  return (
    <div id="scinsmedia-home-page" className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden pt-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] border-b border-slate-200/80">
        <HeroVisual />

        <div className="relative z-10 max-w-5xl mx-auto text-center py-16 sm:py-24 space-y-6">
          {/* Scientific Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" />
            <span>2026–2027 International Scientific Calendar Live</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 font-display leading-[1.1]">
            Global Scientific Conferences,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-900">
              Research & Innovation.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Connecting leading researchers, universities, healthcare pioneers, and industry leaders across 170+ nations through peer-reviewed congresses, Elsevier/Scopus publications, and cross-disciplinary symposiums.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <a
              href="/conferences"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  if (onNavigate) {
                    onNavigate('/conferences');
                  } else {
                    window.location.href = '/conferences';
                  }
                }
              }}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#0A2540] hover:bg-[#0E7490] text-white rounded-2xl text-sm font-semibold shadow-lg shadow-slate-900/10 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer text-center"
            >
              <span>Explore Paris 2026 Flagship</span>
              <ArrowRight className="w-4 h-4 text-teal-300" />
            </a>
            <button
              onClick={() => {
                const el = document.getElementById('upcoming-conferences') || document.getElementById('conference-discovery-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 rounded-2xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              Discover 500+ Conferences
            </button>
          </div>

          {/* Instant Search Bar Trigger */}
          <div className="pt-6 max-w-2xl mx-auto">
            <div
              onClick={onOpenSearch}
              className="w-full bg-white/90 backdrop-blur-md border border-slate-300/80 hover:border-teal-500 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between shadow-lg shadow-slate-200/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-3 pl-3 text-slate-400 group-hover:text-slate-600">
                <Search className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-slate-500">
                  Search by domain, topic, city (e.g., Paris, Biopolymers, Nanomedicine, AI)...
                </span>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1.5 bg-slate-100 group-hover:bg-teal-50 text-slate-600 group-hover:text-teal-700 text-xs font-semibold rounded-xl transition-colors">
                Quick Search
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GLOBAL IMPACT STATS */}
      <section className="bg-[#0A2540] text-white py-14 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            <div className="text-center pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#14B8A6] font-display">170+</div>
              <div className="text-xs sm:text-sm text-slate-200 font-medium mt-1">Participating Countries</div>
              <div className="text-[11px] text-slate-400 mt-0.5">International delegations</div>
            </div>
            <div className="text-center pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#14B8A6] font-display">2,500+</div>
              <div className="text-xs sm:text-sm text-slate-200 font-medium mt-1">Academic & Research Partners</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Top-tier universities & institutes</div>
            </div>
            <div className="text-center pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#14B8A6] font-display">100,000+</div>
              <div className="text-xs sm:text-sm text-slate-200 font-medium mt-1">Scientists & Researchers</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Active scholarly network</div>
            </div>
            <div className="text-center pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#14B8A6] font-display">500+</div>
              <div className="text-xs sm:text-sm text-slate-200 font-medium mt-1">Conferences & Proceedings</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scopus & SCI indexed</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL ABOUT SCINSMEDIA */}
      <section className="pt-16 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md">
              <span>About the Scinsmedia Scientific Charter</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display leading-tight">
              An Open Global Platform for Unrestricted Scientific Exchange
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Founded on the belief that cross-disciplinary cooperation is vital to addressing humanity’s greatest challenges, Scinsmedia designs, chairs, and publishes high-impact academic congresses.
            </p>
            <div className="space-y-3 pt-2">
              {[
                { title: 'Rigorous Single-Blind Peer Review', desc: 'Every abstract is reviewed by appointed international committee chairs before inclusion.' },
                { title: 'Indexed DOI & Proceeding Archival', desc: 'Conference proceedings indexed in Elsevier Scopus, Web of Science, and CrossRef.' },
                { title: 'Hybrid Real-Time Global Delivery', desc: 'Seamlessly combines physical auditoriums with broadcast-grade interactive digital access.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white border border-slate-200/80">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80"
                alt="Scientific Laboratory"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white space-y-1">
                <div className="text-[10px] font-mono text-teal-400 uppercase tracking-widest">
                  Featured Congress Venue
                </div>
                <div className="text-base font-bold">Paris Congress Center • France</div>
                <div className="text-xs text-slate-300">
                  Hosting 450+ physical delegates and 3,000+ virtual academic attendees across 20 scientific sessions.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. UPCOMING INTERNATIONAL CONGRESSES */}
      <section id="upcoming-conferences" className="scroll-mt-[90px] lg:scroll-mt-[110px] pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="conference-discovery-section" className="scroll-mt-[90px] lg:scroll-mt-[110px]" />
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Upcoming International Congresses
            </h2>
          </div>

          {/* Conference Cards Grid */}
          {ongoingConferences.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingConferences.map(conf => (
                  <ConferenceCard
                    key={conf.id}
                    conference={conf}
                    onSelect={onSelectConference}
                  />
                ))}
              </div>

              {/* Centered Show More Button */}
              <div className="pt-2 flex justify-center">
                <a
                  href="/conferences"
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                      e.preventDefault();
                      onNavigate('/conferences');
                    }
                  }}
                  className="inline-flex items-center justify-center space-x-1.5 px-6 py-2.5 text-xs font-semibold text-slate-700 hover:text-teal-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-teal-500 rounded-full shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  <span>Show More ↓</span>
                </a>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No upcoming conferences found</h3>
              <p className="text-xs text-slate-400 mt-1">Check back soon for new congress schedules.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

